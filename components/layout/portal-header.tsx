'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function PortalHeader() {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/portal">
          <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            systm.re
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex gap-6">
          <Link href="/portal" className="text-sm font-medium hover:text-primary transition-colors">
            Projects
          </Link>
          <Link href="/portal/requests" className="text-sm font-medium hover:text-primary transition-colors">
            Requests
          </Link>
          <Link href="/portal/booking" className="text-sm font-medium hover:text-primary transition-colors">
            Booking
          </Link>
        </nav>

        {/* User menu */}
        <div className="flex items-center gap-4">
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profile.avatar_url || undefined}
                      alt={profile.full_name || 'User'}
                    />
                    <AvatarFallback>
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
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
