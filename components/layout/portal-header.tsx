'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, FolderKanban, FileText, Calendar, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePortalClient } from '@/providers/portal-client-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS_ACTIVE = [
  { href: '/portal', label: 'Projet', icon: FolderKanban },
  { href: '/portal/support', label: 'Support', icon: MessageCircle },
  { href: '/portal/requests', label: 'Requêtes', icon: FileText },
  { href: '/portal/booking', label: 'Rendez-vous', icon: Calendar },
];

const NAV_ITEMS_FINISHED = [
  { href: '/portal', label: 'Projet', icon: FolderKanban },
  { href: '/portal/support', label: 'Support', icon: MessageCircle },
  { href: '/portal/requests', label: 'Requêtes', icon: FileText },
];

export function PortalHeader() {
  const { profile, signOut } = useAuth();
  const { isProjectFinished } = usePortalClient();
  const pathname = usePathname();

  const navItems = isProjectFinished ? NAV_ITEMS_FINISHED : NAV_ITEMS_ACTIVE;

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/[a-z]{2}/, '');
    if (href === '/portal') return cleanPath === '/portal' || cleanPath === '/portal/';
    return cleanPath.startsWith(href);
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/portal" className="flex items-center gap-2">
          <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            systm.re
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={profile.avatar_url || undefined}
                      alt={profile.full_name || 'Utilisateur'}
                    />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary/80 to-primary text-white">
                      {profile.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
