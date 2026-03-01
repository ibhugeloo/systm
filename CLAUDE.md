# systm.re Platform

Plateforme interne de gestion du pipeline commercial pour l'équipe systm.re.
Permet de gérer les clients, générer des MVP avec l'IA, organiser des démos, et produire des documents de handoff.

## Stack technique

- **Framework** : Next.js 15 (App Router)
- **UI** : React 19, Tailwind CSS 3, shadcn/ui (Radix)
- **Base de données** : Supabase (PostgreSQL) — utilisé pour le stockage des données uniquement (pas pour l'auth)
- **IA** : Anthropic Claude API (`@anthropic-ai/sdk`)
- **Email** : Resend + React Email
- **Analytics** : PostHog
- **i18n** : FR uniquement (fichier JSON dans `dictionaries/fr.json`)
- **Auth** : Cookie simple (`systm-auth`) — authentification par email, pas d'inscription
- **Déploiement** : Coolify (variables d'environnement gérées dans Coolify)

## Commandes

```bash
npm run dev        # Serveur de développement (port 3000)
npm run build      # Build de production
npm run start      # Serveur de production
npm run lint       # Linter ESLint
```

## Authentification

L'authentification est simplifiée pour un usage local en entreprise.

- **Identifiant** : `goat`
- **Mot de passe** : `superpass`
- **Rôle** : admin

Les credentials sont définis dans `lib/auth.ts`. Le login passe par `/api/auth/login` qui pose un cookie httpOnly.
Le middleware (`middleware.ts`) protège les routes `/dashboard`, `/team`, `/settings` en vérifiant la présence du cookie.

## Structure du projet

```
app/
├── [locale]/(auth)/login/           # Page de connexion
├── [locale]/(dashboard)/            # Zone protégée (commerciaux)
│   ├── dashboard/                   # Pipeline Kanban des clients
│   ├── clients/                     # Liste des clients
│   │   └── [clientId]/
│   │       ├── onboarding/          # Formulaire d'onboarding client
│   │       ├── mvp/                 # Éditeur de MVP (canvas IA)
│   │       ├── demo/                # Mode démo client
│   │       ├── conversation/        # Discussion avec le client
│   │       ├── handoff/             # Génération du document de handoff
│   │       └── requests/            # Requêtes du client
│   ├── team/                        # Gestion de l'équipe (admin)
│   └── settings/                    # Paramètres et intégrations
├── [locale]/(portal)/portal/        # Portail client (vue client)
│   ├── booking/                     # Widget de réservation Cal.com
│   └── requests/                    # Requêtes du client
├── api/
│   ├── auth/login/                  # POST — connexion
│   ├── auth/logout/                 # POST — déconnexion
│   ├── ai/generate-mvp/             # POST — génération MVP via Claude
│   ├── ai/modify-mvp/              # POST — modification MVP via Claude
│   ├── ai/generate-handoff/         # POST — génération handoff via Claude
│   ├── ai/summarize-conversation/   # POST — résumé de conversation via Claude
│   ├── email/send-handoff/          # POST — envoi email de handoff
│   └── webhooks/stripe/             # Webhook Stripe
components/
├── conversation/                    # Panel de discussion
├── handoff/                         # Éditeur et preview handoff
├── layout/                          # Sidebar, header, language switcher
├── mvp/                             # Éditeur MVP, blocks, canvas
│   └── blocks/                      # Hero, CTA, Features, Form, etc.
├── onboarding/                      # Formulaire d'onboarding multi-étapes
├── portal/                          # Composants du portail client
└── ui/                              # Primitives shadcn/ui
lib/
├── ai/                              # Client Claude + prompts
├── email/                           # Client Resend + templates
├── supabase/                        # Client Supabase (client.ts, server.ts)
├── hooks/                           # Hook useAuth
├── validation/                      # Schémas Zod pour l'onboarding
├── auth.ts                          # Credentials et session
├── get-dictionaries.ts              # Chargement des traductions
├── i18n-config.ts                   # Configuration i18n (fr, en)
└── utils.ts                         # Utilitaire cn() pour Tailwind
providers/
├── auth-provider.tsx                # Context d'auth (cookie-based)
├── theme-provider.tsx               # Dark/light mode
└── posthog-provider.tsx             # Analytics PostHog
types/
├── database.ts                      # Types Supabase (Profile, Client, Mvp, etc.)
├── mvp.ts                           # Types du canvas MVP (MvpCanvas, Block, etc.)
├── handoff.ts                       # Types handoff
└── onboarding.ts                    # Types du formulaire d'onboarding
supabase/
├── setup.sql                        # Script complet de création des tables
└── migrations/                      # Migrations individuelles (001-007)
```

## Base de données (Supabase)

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (id, email, full_name, role) |
| `clients` | Clients avec statut pipeline (onboarding → closed) |
| `mvps` | MVP générés par l'IA (canvas_data en JSONB) |
| `conversations` | Messages de discussion (messages en JSONB) |
| `handoffs` | Documents de handoff (markdown_content) |
| `client_requests` | Requêtes clients (feature, bug, meeting, question) |

### Statuts pipeline client

`onboarding` → `mvp_generated` → `demo_scheduled` → `demo_done` → `handoff_sent` → `in_production` → `closed`

### RLS (Row Level Security)

Les policies RLS sont définies dans `supabase/setup.sql`. Elles utilisent les rôles Supabase Auth (`auth.uid()`).
**Note** : Comme l'auth Supabase a été désactivée, les requêtes Supabase utilisent la clé `anon` sans session utilisateur. Les policies RLS actuelles peuvent bloquer certaines opérations. Voir la section "À faire" ci-dessous.

## Variables d'environnement

Copier `.env.local.example` vers `.env.local` et remplir :

| Variable | Requis | Usage |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé anonyme Supabase |
| `ANTHROPIC_API_KEY` | Oui | Clé API Claude (génération MVP/handoff) |
| `RESEND_API_KEY` | Non | Envoi d'emails |
| `STRIPE_SECRET_KEY` | Non | Paiements (non implémenté) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Non | Analytics |
| `NEXT_PUBLIC_CALCOM_URL` | Non | Widget de réservation |

## Conventions

- **Langue du code** : anglais (noms de variables, composants, fichiers)
- **Langue de l'UI** : français uniquement
- **Composants UI** : utiliser les composants shadcn/ui dans `components/ui/`
- **Formulaires** : validation avec Zod (`lib/validation/`)
- **Notifications** : utiliser `toast` de `sonner`
- **Routes API** : toujours dans `app/api/`, utiliser le client Supabase serveur
- **Pages serveur** : ajouter `export const dynamic = 'force-dynamic'` si elles utilisent des cookies

---

## À faire (prochaines étapes)

### Priorité haute

1. **Corriger les policies RLS Supabase**
   - L'auth Supabase est désactivée → les requêtes passent avec la clé `anon` sans `auth.uid()`
   - Les policies actuelles utilisent `auth.uid()` ce qui bloque les opérations
   - **Solution** : soit utiliser la clé `service_role` côté serveur (dans `lib/supabase/server.ts`), soit simplifier les policies RLS pour autoriser toutes les opérations en mode `anon`

2. **Tester le flux complet d'onboarding → MVP → handoff**
   - Créer un nouveau client via le formulaire d'onboarding
   - Vérifier que la génération de MVP fonctionne (nécessite la clé Anthropic)
   - Tester le mode démo
   - Générer un handoff

3. **Ajouter la gestion multi-utilisateurs pour les commerciaux**
   - Actuellement un seul user hardcodé (`goat`)
   - Créer un système simple avec une table `users` locale ou un fichier JSON
   - Permettre à chaque commercial d'avoir son propre identifiant

### Priorité moyenne

4. **Configurer l'envoi d'emails (Resend)**
   - Ajouter la clé `RESEND_API_KEY` dans `.env.local`
   - Tester l'envoi de handoff par email
   - Personnaliser les templates dans `lib/email/templates/`

5. **Stripe** : intentionnellement en mode placeholder/fake pour l'instant — ne pas toucher

6. **Améliorer le portail client**
   - Le portail (`/portal`) est fonctionnel mais basique
   - Ajouter un suivi en temps réel du projet
   - Intégrer le widget Cal.com pour la prise de RDV

### Priorité basse

7. **Réintroduire une vraie auth si besoin**
   - Si l'app doit être exposée sur internet, réactiver Supabase Auth ou implémenter NextAuth.js
   - Le provider `auth-provider.tsx` est déjà structuré pour être étendu

8. **Ajouter des tests**
   - Tests unitaires sur les schémas Zod et les utilitaires
   - Tests E2E sur le flux d'onboarding (Playwright)

9. **Déploiement sur Coolify** (déjà en place)
   - Les variables d'environnement sont configurées directement dans Coolify
   - Pas besoin de validation des env vars au démarrage (gérées par Coolify)

10. **Analytics PostHog**
    - Ajouter la clé PostHog
    - Tracker les événements clés (onboarding complété, MVP généré, handoff envoyé)
    - Les événements sont déjà définis dans `lib/posthog-events.ts`
