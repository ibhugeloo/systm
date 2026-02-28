export const dynamic = 'force-dynamic';

import { getDictionary } from '@/lib/get-dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as 'fr');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.settings}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom complet</label>
            <Input value="Admin GOAT" disabled className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value="goat@systm.re" disabled className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Rôle</label>
            <div className="mt-1">
              <Badge>admin</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intégrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Supabase</p>
              <p className="text-sm text-muted-foreground">Base de données & Auth</p>
            </div>
            <Badge variant="default">Connecté</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Claude AI</p>
              <p className="text-sm text-muted-foreground">Génération de MVP & Handoff</p>
            </div>
            <Badge variant={process.env.ANTHROPIC_API_KEY ? 'default' : 'secondary'}>
              {process.env.ANTHROPIC_API_KEY ? 'Configuré' : 'Non configuré'}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Resend</p>
              <p className="text-sm text-muted-foreground">Emails transactionnels</p>
            </div>
            <Badge variant={process.env.RESEND_API_KEY ? 'default' : 'secondary'}>
              {process.env.RESEND_API_KEY ? 'Configuré' : 'Non configuré'}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Stripe</p>
              <p className="text-sm text-muted-foreground">Paiements</p>
            </div>
            <Badge variant="secondary">Non configuré</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">PostHog</p>
              <p className="text-sm text-muted-foreground">Analytics</p>
            </div>
            <Badge variant={process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'default' : 'secondary'}>
              {process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'Configuré' : 'Non configuré'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
