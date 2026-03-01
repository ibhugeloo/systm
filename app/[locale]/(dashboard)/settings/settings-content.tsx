'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Bell, BellOff, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface SettingsContentProps {
  profile: Profile;
  clients: Array<{ id: string; company_name: string }>;
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function SettingsContent({ profile, clients }: SettingsContentProps) {
  const { theme, setTheme } = useTheme();
  const settings = (profile.settings || {}) as Record<string, unknown>;

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    (settings.notifications_enabled as boolean) ?? true
  );
  const [clientNotifs, setClientNotifs] = useState<Record<string, boolean>>(
    (settings.client_notifications as Record<string, boolean>) || {}
  );
  const [discordUrl, setDiscordUrl] = useState(
    (settings.discord_webhook_url as string) || ''
  );
  const [discordEnabled, setDiscordEnabled] = useState(
    (settings.discord_enabled as boolean) ?? false
  );
  const [discordEvents, setDiscordEvents] = useState<string[]>(
    (settings.discord_events as string[]) || ['new_message', 'new_request', 'status_change']
  );
  const [saving, setSaving] = useState(false);

  const toggleClientNotif = (clientId: string) => {
    setClientNotifs((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const toggleDiscordEvent = (event: string) => {
    setDiscordEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      const newSettings = {
        notifications_enabled: notificationsEnabled,
        client_notifications: clientNotifs,
        discord_webhook_url: discordUrl || null,
        discord_enabled: discordEnabled,
        discord_events: discordEvents,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          settings: newSettings,
        })
        .eq('id', profile.id);

      if (error) {
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Paramètres enregistrés');
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ];

  const discordEventLabels: Record<string, string> = {
    new_message: 'Nouveau message',
    new_request: 'Nouvelle requête',
    status_change: 'Changement de statut',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary/80 to-primary text-white">
                {getInitials(fullName || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{fullName}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                {profile.role === 'team_member' ? 'Équipe' : profile.role === 'admin' ? 'Admin' : 'Client'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom complet</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={profile.email} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>Choisissez le thème de l&apos;interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications chat</CardTitle>
          <CardDescription>Gérez les notifications du support client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`flex items-center justify-between w-full p-3 rounded-lg border-2 transition-all ${
              notificationsEnabled ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                Notifications {notificationsEnabled ? 'activées' : 'désactivées'}
              </span>
            </div>
            <div className={`h-6 w-11 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-primary' : 'bg-muted'
            } relative`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {notificationsEnabled && clients.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground">Par client</p>
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleClientNotif(c.id)}
                  className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{c.company_name}</span>
                  <div className={`h-5 w-9 rounded-full transition-colors ${
                    clientNotifs[c.id] ? 'bg-primary' : 'bg-muted'
                  } relative`}>
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      clientNotifs[c.id] ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discord Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Discord</CardTitle>
          <CardDescription>Recevez les notifications sur votre serveur Discord</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            onClick={() => setDiscordEnabled(!discordEnabled)}
            className={`flex items-center justify-between w-full p-3 rounded-lg border-2 transition-all ${
              discordEnabled ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <span className="text-sm font-medium">
              Intégration Discord {discordEnabled ? 'activée' : 'désactivée'}
            </span>
            <div className={`h-6 w-11 rounded-full transition-colors ${
              discordEnabled ? 'bg-primary' : 'bg-muted'
            } relative`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                discordEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {discordEnabled && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL du Webhook</label>
                <Input
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Événements</p>
                <div className="space-y-2">
                  {Object.entries(discordEventLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleDiscordEvent(key)}
                      className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{label}</span>
                      <div className={`h-5 w-9 rounded-full transition-colors ${
                        discordEvents.includes(key) ? 'bg-primary' : 'bg-muted'
                      } relative`}>
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          discordEvents.includes(key) ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
