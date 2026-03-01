import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/ai/claude';
import { getFigmaMakePrompt } from '@/lib/ai/prompts/figma-make-prompt';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { company_name, sector, problem_description } = await request.json();

    if (!company_name || !problem_description) {
      return NextResponse.json(
        { error: 'company_name et problem_description sont requis' },
        { status: 400 }
      );
    }

    const systemPrompt = getFigmaMakePrompt({
      company_name,
      sector: sector || '',
      problem_description,
    });

    const prompt = await callClaude(
      systemPrompt,
      'Génère le prompt Figma Make maintenant.'
    );

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Generate Figma prompt error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
