import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamClaude } from '@/lib/ai/claude';
import { getMvpModificationPrompt } from '@/lib/ai/prompts/mvp-modification';
import { MvpCanvas } from '@/types/mvp';

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

    // Stream the response
    const stream = await streamClaude(
      prompt,
      `Apply this modification: ${modification}`
    );

    // Collect the full response and return the modified canvas
    const reader = stream.getReader();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += value;
    }

    // Parse the modified canvas
    let modifiedCanvas: Record<string, unknown>;
    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      modifiedCanvas = JSON.parse(jsonMatch[0]);
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
