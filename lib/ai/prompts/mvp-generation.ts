import { OnboardingFormData } from '@/types/onboarding';

export function getMvpGenerationPrompt(onboardingData: OnboardingFormData): string {
  const isTechSector = ['tech', 'saas', 'logiciel', 'software'].some(
    (s) => onboardingData.sector?.toLowerCase().includes(s)
  );

  return `You are an expert product strategist and MVP designer for a French agency called systm.re.
Your task is to generate a compelling MVP landing page canvas based on the client's onboarding data.
The goal is to show the client what their product could look like as a landing page.

Client Information:
- Company: ${onboardingData.company_name}
- Sector: ${onboardingData.sector}
- Problem: ${onboardingData.problem_description}
- Main Objective: ${onboardingData.main_objective || 'Not specified'}
- Existing Stack: ${onboardingData.existing_stack?.join(', ') || 'None specified'}
- Tech Constraints: ${onboardingData.tech_constraints || 'None'}
- Required Integrations: ${onboardingData.required_integrations?.join(', ') || 'None'}
- Budget Range: ${onboardingData.budget_range}
- Desired Timeline: ${onboardingData.desired_timeline}
- Priority: ${onboardingData.priority}

Generate a landing page MVP canvas with these blocks (in order, stacked vertically):

1. **hero** — A compelling hero section with a headline that speaks to the client's problem, a subtitle that describes the solution, and a CTA button. Make the headline punchy and the subtitle explanatory.

2. **features** — 3-4 key features that solve the client's main objective. Each feature needs a title and description. Be specific to the client's domain, not generic.

3. **stats** — 4 business impact metrics relevant to the client's sector. Use realistic but impressive numbers (e.g., "+45% productivity", "2x faster", "$50K saved/year", "99.9% uptime").

4. **pricing** — 3 pricing tiers adapted to the client's budget range and sector. Include tier names, prices, and feature lists. Make the middle tier the best value.

5. **cta** — A final call-to-action section with a strong headline and button.

${isTechSector ? '6. **dashboard** — A dashboard preview section with 4 relevant metric widgets for monitoring.\n\n7. **data-table** — A sample data table with 3 columns and 3-4 rows showing relevant data for the client\'s domain.' : ''}

CRITICAL RULES:
- Output ONLY valid JSON, no markdown, no explanations, no code blocks
- Use the EXACT field names shown in the example below
- All text content should be in French
- Be specific to the client's business, never generic placeholder text
- Blocks are stacked vertically (each block spans full width, col=1, width=12)

Return this EXACT JSON structure:
{
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "row": 1, "col": 1, "width": 12, "height": 3,
      "data": {
        "title": "Headline here",
        "subtitle": "Subtitle here",
        "ctaText": "Button text"
      }
    },
    {
      "id": "features-1",
      "type": "features",
      "row": 4, "col": 1, "width": 12, "height": 4,
      "data": {
        "title": "Section title",
        "items": [
          { "title": "Feature name", "description": "Feature description" }
        ]
      }
    },
    {
      "id": "stats-1",
      "type": "stats",
      "row": 8, "col": 1, "width": 12, "height": 2,
      "data": {
        "title": "Section title",
        "stats": [
          { "label": "Metric name", "value": "Value", "change": "+XX%" }
        ]
      }
    },
    {
      "id": "pricing-1",
      "type": "pricing",
      "row": 10, "col": 1, "width": 12, "height": 5,
      "data": {
        "title": "Section title",
        "plans": [
          { "name": "Tier name", "price": "XX€/mois", "features": ["Feature 1", "Feature 2"] }
        ]
      }
    },
    {
      "id": "cta-1",
      "type": "cta",
      "row": 15, "col": 1, "width": 12, "height": 2,
      "data": {
        "title": "CTA headline",
        "description": "CTA description",
        "ctaText": "Button text"
      }
    }
  ],
  "metadata": {
    "title": "MVP Canvas for ${onboardingData.company_name}",
    "description": "${onboardingData.main_objective || onboardingData.problem_description}"
  }
}`;
}
