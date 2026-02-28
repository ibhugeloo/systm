import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/ai/claude';
import { getMvpGenerationPrompt } from '@/lib/ai/prompts/mvp-generation';
import { OnboardingFormData } from '@/types/onboarding';
import { MvpCanvas } from '@/types/mvp';
import { normalizeCanvas } from '@/lib/ai/normalize-canvas';

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
