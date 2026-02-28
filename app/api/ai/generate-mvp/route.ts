import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/ai/claude';
import { getMvpGenerationPrompt } from '@/lib/ai/prompts/mvp-generation';
import { OnboardingFormData, AiEstimation } from '@/types/onboarding';
import { MvpCanvas } from '@/types/mvp';
import { normalizeCanvas } from '@/lib/ai/normalize-canvas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData?.company_name || !formData?.problem_description) {
      return NextResponse.json(
        { error: 'company_name and problem_description are required' },
        { status: 400 }
      );
    }

    const enrichedData: Partial<OnboardingFormData> = {
      company_name: formData.company_name,
      sector: formData.sector || '',
      problem_description: formData.problem_description,
      existing_stack: formData.existing_stack || [],
      tech_constraints: formData.tech_constraints || '',
      required_integrations: formData.required_integrations || [],
    };

    // Generate MVP via Claude
    const systemPrompt = getMvpGenerationPrompt(enrichedData);
    const response = await callClaude(
      systemPrompt,
      'Génère le JSON du canvas MVP et l\'estimation maintenant.'
    );

    // Parse the JSON response
    let canvasData: MvpCanvas;
    let estimation: AiEstimation | null = null;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const rawData = JSON.parse(jsonMatch[0]);

      // Extract estimation if present
      if (rawData.estimation) {
        estimation = rawData.estimation as AiEstimation;
      }

      // Normalize the canvas (blocks + metadata)
      canvasData = normalizeCanvas(rawData);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Claude response:', response);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      canvas: canvasData,
      estimation,
    });
  } catch (error) {
    console.error('Generate MVP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
