import { OnboardingFormData } from '@/types/onboarding';

export function getMvpGenerationPrompt(onboardingData: Partial<OnboardingFormData>): string {
  const isTechSector = ['tech', 'saas', 'logiciel', 'software'].some(
    (s) => onboardingData.sector?.toLowerCase().includes(s)
  );

  return `Tu es un expert en stratégie produit et conception de MVP pour une agence française appelée systm.re.
Ta mission est de générer un canvas de landing page MVP convaincant ET une estimation détaillée du projet, basés sur les données du client.

Informations client :
- Entreprise : ${onboardingData.company_name}
- Secteur : ${onboardingData.sector}
- Problème : ${onboardingData.problem_description}
- Stack existante : ${onboardingData.existing_stack?.join(', ') || 'Non spécifié'}
- Contraintes techniques : ${onboardingData.tech_constraints || 'Aucune'}
- Intégrations requises : ${onboardingData.required_integrations?.join(', ') || 'Aucune'}

Génère un canvas de landing page MVP avec ces blocs (dans l'ordre, empilés verticalement) :

1. **hero** — Un héros accrocheur avec un titre qui parle du problème du client, un sous-titre décrivant la solution, et un bouton CTA. Titre percutant, sous-titre explicatif.

2. **features** — 3-4 fonctionnalités clés qui résolvent le problème du client. Chaque fonctionnalité a un titre et une description. Sois spécifique au domaine du client.

3. **stats** — 4 métriques d'impact business pertinentes pour le secteur. Utilise des chiffres réalistes mais impressionnants (ex: "+45% de productivité", "2x plus rapide", "50K€ économisés/an", "99.9% de disponibilité").

4. **pricing** — 3 niveaux de tarification adaptés au secteur. Inclus le nom du tier, le prix et la liste des fonctionnalités. Le tier du milieu est le meilleur rapport qualité/prix.

5. **cta** — Un dernier appel à l'action avec un titre fort et un bouton.

${isTechSector ? '6. **dashboard** — Un aperçu de tableau de bord avec 4 widgets de métriques pertinentes.\n\n7. **data-table** — Un tableau de données échantillon avec 3 colonnes et 3-4 lignes montrant des données pertinentes.' : ''}

EN PLUS du canvas, génère une estimation détaillée du projet :
- Durée totale estimée (fourchette)
- Budget estimé (fourchette en euros)
- Complexité du projet (low, medium, high)
- Découpage en phases (4-6 phases) avec durée et coût par phase

RÈGLES CRITIQUES :
- Retourne UNIQUEMENT du JSON valide, pas de markdown, pas d'explications, pas de blocs de code
- Utilise les NOMS DE CHAMPS EXACTS montrés dans l'exemple ci-dessous
- Tout le contenu textuel doit être en français
- Sois spécifique au business du client, jamais de texte générique
- Les blocs sont empilés verticalement (chaque bloc en pleine largeur, col=1, width=12)

Retourne cette structure JSON EXACTE :
{
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "row": 1, "col": 1, "width": 12, "height": 3,
      "data": {
        "title": "Titre ici",
        "subtitle": "Sous-titre ici",
        "ctaText": "Texte du bouton"
      }
    },
    {
      "id": "features-1",
      "type": "features",
      "row": 4, "col": 1, "width": 12, "height": 4,
      "data": {
        "title": "Titre de section",
        "items": [
          { "title": "Nom de la fonctionnalité", "description": "Description" }
        ]
      }
    },
    {
      "id": "stats-1",
      "type": "stats",
      "row": 8, "col": 1, "width": 12, "height": 2,
      "data": {
        "title": "Titre de section",
        "stats": [
          { "label": "Nom de la métrique", "value": "Valeur", "change": "+XX%" }
        ]
      }
    },
    {
      "id": "pricing-1",
      "type": "pricing",
      "row": 10, "col": 1, "width": 12, "height": 5,
      "data": {
        "title": "Titre de section",
        "plans": [
          { "name": "Nom du tier", "price": "XX€/mois", "features": ["Fonctionnalité 1", "Fonctionnalité 2"] }
        ]
      }
    },
    {
      "id": "cta-1",
      "type": "cta",
      "row": 15, "col": 1, "width": 12, "height": 2,
      "data": {
        "title": "Titre CTA",
        "description": "Description CTA",
        "ctaText": "Texte du bouton"
      }
    }
  ],
  "estimation": {
    "duration": "2-3 mois",
    "budget": "15 000 € - 25 000 €",
    "complexity": "medium",
    "breakdown": [
      { "phase": "Design & Maquettes", "duration": "2 semaines", "cost": "3 000 €" },
      { "phase": "Développement Front-end", "duration": "4 semaines", "cost": "8 000 €" },
      { "phase": "Développement Back-end", "duration": "3 semaines", "cost": "6 000 €" },
      { "phase": "Intégrations & API", "duration": "1 semaine", "cost": "2 000 €" },
      { "phase": "Tests & Déploiement", "duration": "1 semaine", "cost": "2 000 €" }
    ]
  },
  "metadata": {
    "title": "MVP Canvas pour ${onboardingData.company_name}",
    "description": "${onboardingData.problem_description?.slice(0, 200) || ''}"
  }
}`;
}
