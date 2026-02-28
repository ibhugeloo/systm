import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/ai/claude';
import { getMvpModificationPrompt } from '@/lib/ai/prompts/mvp-modification';
import { MvpCanvas } from '@/types/mvp';
import { normalizeCanvas } from '@/lib/ai/normalize-canvas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mvpId, modification, currentCanvas } = body;

    if (!mvpId || !modification || !currentCanvas) {
      return NextResponse.json(
        { error: 'mvpId, modification, and currentCanvas are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate modification prompt
    const prompt = getMvpModificationPrompt(
      currentCanvas as MvpCanvas,
      modification
    );

    // Call Claude (non-streaming since we need the full response)
    const fullResponse = await callClaude(
      prompt,
      `Apply this modification: ${modification}`
    );

    // Parse and normalize the modified canvas
    let modifiedCanvas: MvpCanvas;
    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const rawCanvas = JSON.parse(jsonMatch[0]);
      modifiedCanvas = normalizeCanvas(rawCanvas);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI modification' },
        { status: 500 }
      );
    }

    // Update the MVP in database
    const { error: updateError } = await supabase
      .from('mvps')
      .update({
        canvas_data: modifiedCanvas,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mvpId);

    if (updateError) {
      console.error('Failed to update MVP:', updateError);
    }

    return NextResponse.json({
      canvas: modifiedCanvas,
    });
  } catch (error) {
    console.error('Modify MVP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
