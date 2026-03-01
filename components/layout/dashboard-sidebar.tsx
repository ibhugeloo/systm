'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Users, FolderKanban, Sparkles, UserPlus, Settings, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Projets', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'MVP', href: '/dashboard/mvps', icon: Sparkles },
  { label: 'Utilisateurs', href: '/dashboard/users', icon: UserPlus },
  { label: 'Paramètres', href: '/settings', icon: Settings },
];

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const visibleItems = navItems;

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-64 border-r border-border bg-background transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link href="/dashboard" className="mb-8 mt-4 lg:mt-0">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              systm.re
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {visibleItems.map((item) => {
              const isActive = item.href === '/dashboard'
                ? pathname.replace(/^\/[a-z]{2}/, '') === '/dashboard'
                : pathname.includes(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border pt-4 space-y-4">
            {profile && (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={profile.avatar_url || undefined}
                    alt={profile.full_name || 'Utilisateur'}
                  />
                  <AvatarFallback>
                    {profile.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
