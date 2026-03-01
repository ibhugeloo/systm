import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/ai/claude';
import { ConversationMessage } from '@/types/database';
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
    const { conversationId, clientId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const messages = (conversation.messages || []) as ConversationMessage[];

    if (messages.length === 0) {
      return NextResponse.json({
        summary: 'Aucune conversation enregistrée pour le moment.',
      });
    }

    // Fetch client info for context
    let clientContext = '';
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('company_name, sector, problem_description')
        .eq('id', clientId)
        .single();

      if (client) {
        clientContext = `Client: ${client.company_name} (${client.sector}). Problème: ${client.problem_description}`;
      }
    }

    const formattedMessages = messages
      .map((m) => `[${m.sender_role}] ${m.content}`)
      .join('\n');

    const summary = await callClaude(
      `You are a conversation analyst. Summarize the following conversation in 2-3 concise paragraphs in French. Focus on key decisions, open questions, and action items.${clientContext ? `\n\nContext: ${clientContext}` : ''}`,
      formattedMessages
    );

    // Update the conversation with the new summary
    await supabase
      .from('conversations')
      .update({ context_summary: summary })
      .eq('id', conversationId);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarize conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
