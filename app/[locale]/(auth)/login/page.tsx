'use client';

import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        toast.error('Identifiants invalides');
      } else {
        window.location.href = '/fr/dashboard';
      }
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none" />

        <div className="relative z-10 px-16 max-w-lg">
          <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
            systm.re
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Gérez vos projets clients de A à Z
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            De l&apos;onboarding à la livraison, pilotez chaque étape avec une plateforme pensée pour les agences modernes.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Onboarding', 'MVP Canvas', 'Pipeline', 'Portail client'].map((feature) => (
              <span
                key={feature}
                className="px-3 py-1.5 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              systm.re
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
            <p className="text-muted-foreground">
              Connectez-vous à votre espace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Identifiant
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Votre identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 gap-2 text-base" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
