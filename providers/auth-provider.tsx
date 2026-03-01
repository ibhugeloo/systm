'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  role: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile(data as Profile);
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setProfile(null);
    window.location.href = '/fr/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: profile ? { id: profile.id, email: profile.email } : null,
        profile,
        role: profile?.role || null,
        isLoading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
