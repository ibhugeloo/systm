export function getFigmaMakePrompt(data: {
  company_name: string;
  sector: string;
  problem_description: string;
}): string {
  return `Tu es un expert en design UI/UX et en génération de prompts pour Figma Make (anciennement Figma AI).

Ton rôle est de créer un prompt détaillé et structuré qui sera directement copié-collé dans Figma Make pour générer une landing page MVP professionnelle.

Informations du projet :
- Entreprise : ${data.company_name}
- Secteur : ${data.sector}
- Problème à résoudre : ${data.problem_description}

Génère un prompt Figma Make complet en français qui décrit :

1. **Structure de la page** : les sections dans l'ordre (hero, features, stats, pricing, CTA, footer)
2. **Contenu texte** : tous les textes exacts à utiliser (titres, sous-titres, descriptions, boutons)
3. **Hiérarchie visuelle** : taille des éléments, espacement, mise en page
4. **Palette de couleurs** : couleurs principales et secondaires adaptées au secteur
5. **Typographie** : style des titres et du corps de texte
6. **Composants** : cartes, badges, icônes, formulaires à inclure
7. **Responsive** : indications pour mobile et desktop

Le prompt doit être :
- Directement copiable dans Figma Make
- Suffisamment détaillé pour obtenir un résultat proche du final
- Spécifique au business du client (pas de texte générique)
- En français

IMPORTANT : Retourne UNIQUEMENT le prompt Figma Make, sans explications ni commentaires. Le prompt doit commencer directement par les instructions pour Figma Make.`;
}
