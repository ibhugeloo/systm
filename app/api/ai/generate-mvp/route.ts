import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/ai/claude';
import { getMvpGenerationPrompt } from '@/lib/ai/prompts/mvp-generation';
import { OnboardingFormData } from '@/types/onboarding';
import { MvpBlock, MvpCanvas } from '@/types/mvp';

/**
 * Normalize a block from Claude's response to match MvpBlock structure.
 * Handles both formats: position+content (old) and row/col+data (new).
 */
function normalizeBlock(raw: Record<string, unknown>): MvpBlock {
  const position = raw.position as Record<string, number> | undefined;
  const content = raw.content as Record<string, unknown> | undefined;
  const data = raw.data as Record<string, unknown> | undefined;

  // Map old field names (headline/subheadline/cta_text) to new ones (title/subtitle/ctaText)
  const normalizedData = data || content || {};
  if (normalizedData.headline && !normalizedData.title) {
    normalizedData.title = normalizedData.headline;
    delete normalizedData.headline;
  }
  if (normalizedData.subheadline && !normalizedData.subtitle) {
    normalizedData.subtitle = normalizedData.subheadline;
    delete normalizedData.subheadline;
  }
  if (normalizedData.cta_text && !normalizedData.ctaText) {
    normalizedData.ctaText = normalizedData.cta_text;
    delete normalizedData.cta_text;
  }
  if (normalizedData.button_text && !normalizedData.ctaText) {
    normalizedData.ctaText = normalizedData.button_text;
    delete normalizedData.button_text;
  }
  // Map features array to items array
  if (normalizedData.features && !normalizedData.items && raw.type === 'features') {
    normalizedData.items = normalizedData.features;
    delete normalizedData.features;
  }

  return {
    id: (raw.id as string) || `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: (raw.type as MvpBlock['type']) || 'custom',
    row: (raw.row as number) ?? position?.row ?? 1,
    col: (raw.col as number) ?? position?.col ?? 1,
    width: (raw.width as number) ?? position?.width ?? 12,
    height: (raw.height as number) ?? position?.height ?? 3,
    data: normalizedData,
  };
}

function normalizeCanvas(raw: Record<string, unknown>): MvpCanvas {
  const rawBlocks = (raw.blocks as Record<string, unknown>[]) || [];
  const blocks = rawBlocks.map(normalizeBlock);

  // Ensure blocks have sequential non-overlapping rows
  let currentRow = 1;
  for (const block of blocks) {
    block.row = currentRow;
    block.col = 1;
    block.width = 12;
    currentRow += block.height;
  }

  const metadata = raw.metadata as Record<string, unknown> | undefined;

  return {
    blocks,
    gridCols: 12,
    gridRowHeight: 60,
    gap: 8,
    padding: 16,
    metadata: metadata ? {
      title: (metadata.title as string) || '',
      description: (metadata.description as string) || '',
      generatedAt: new Date().toISOString(),
      version: 1,
    } : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch client onboarding data
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

    const onboardingData = (client.onboarding_data || {}) as OnboardingFormData;

    // Fill in defaults from client fields if onboarding_data is sparse
    const enrichedData: OnboardingFormData = {
      company_name: onboardingData.company_name || client.company_name,
      sector: onboardingData.sector || client.sector,
      problem_description: onboardingData.problem_description || client.problem_description,
      main_objective: onboardingData.main_objective || '',
      existing_stack: onboardingData.existing_stack || client.tech_stack || [],
      tech_constraints: onboardingData.tech_constraints || '',
      required_integrations: onboardingData.required_integrations || [],
      budget_range: onboardingData.budget_range || client.budget_range,
      desired_timeline: onboardingData.desired_timeline || client.timeline,
      priority: onboardingData.priority || 'medium',
    };

    // Generate MVP via Claude
    const systemPrompt = getMvpGenerationPrompt(enrichedData);
    const response = await callClaude(
      systemPrompt,
      'Generate the MVP canvas JSON now.'
    );

    // Parse the JSON response
    let canvasData: MvpCanvas;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const rawCanvas = JSON.parse(jsonMatch[0]);
      canvasData = normalizeCanvas(rawCanvas);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Claude response:', response);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Save MVP to database
    const { data: mvp, error: mvpError } = await supabase
      .from('mvps')
      .insert({
        client_id: clientId,
        version: 1,
        canvas_data: canvasData,
        generated_prompt: systemPrompt,
        status: 'draft' as const,
      })
      .select('id')
      .single();

    if (mvpError) {
      console.error('MVP save error:', mvpError);
      return NextResponse.json(
        { error: 'Failed to save MVP' },
        { status: 500 }
      );
    }

    // Update client status
    await supabase
      .from('clients')
      .update({ status: 'mvp_generated' })
      .eq('id', clientId);

    return NextResponse.json({
      mvpId: mvp.id,
      canvas: canvasData,
    });
  } catch (error) {
    console.error('Generate MVP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
