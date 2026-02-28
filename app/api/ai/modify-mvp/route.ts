import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/ai/claude';
import { getMvpModificationPrompt } from '@/lib/ai/prompts/mvp-modification';
import { MvpCanvas } from '@/types/mvp';
import { normalizeCanvas } from '@/lib/ai/normalize-canvas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modification, currentCanvas } = body;

    if (!modification || !currentCanvas) {
      return NextResponse.json(
        { error: 'modification and currentCanvas are required' },
        { status: 400 }
      );
    }

    // Generate modification prompt
    const prompt = getMvpModificationPrompt(
      currentCanvas as MvpCanvas,
      modification
    );

    // Call Claude
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
