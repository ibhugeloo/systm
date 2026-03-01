import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/ai/claude';
import { getHandoffGenerationPrompt } from '@/lib/ai/prompts/handoff-generation';
import { Client, ConversationMessage } from '@/types/database';
import { getAuthSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const limiter = rateLimit(`ai:${session.user.id}`, { interval: 60 * 60 * 1000, maxRequests: 20 });
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Limite d\'appels IA atteinte. Réessayez plus tard.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limiter.resetIn / 1000)) } }
      );
    }

    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch latest MVP id for linking
    const { data: mvp } = await supabase
      .from('mvps')
      .select('id')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch conversation messages
    const { data: conversation } = await supabase
      .from('conversations')
      .select('messages')
      .eq('client_id', clientId)
      .single();

    const messages = (conversation?.messages || []) as ConversationMessage[];

    // Generate handoff via Claude
    const prompt = getHandoffGenerationPrompt({
      client: client as Client,
      messages,
    });

    const markdownContent = await callClaude(
      prompt,
      'Generate the handoff document now.'
    );

    // Save handoff to database
    const { data: handoff, error: handoffError } = await supabase
      .from('handoffs')
      .insert({
        client_id: clientId,
        mvp_id: mvp?.id || null,
        markdown_content: markdownContent,
        sent_to: [],
        status: 'draft' as const,
      })
      .select('id')
      .single();

    if (handoffError) {
      return NextResponse.json(
        { error: 'Failed to save handoff' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      handoffId: handoff.id,
      markdown: markdownContent,
    });
  } catch (error) {
    console.error('Generate handoff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
