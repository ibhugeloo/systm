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

// Static admin profile for local use
const ADMIN_PROFILE: Profile = {
  id: 'local-admin-goat',
  email: 'goat@systm.re',
  full_name: 'Admin GOAT',
  role: 'admin',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasAuth = document.cookie.includes('systm-auth=');
    setIsLoggedIn(hasAuth);
    setIsLoading(false);
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    window.location.href = '/fr/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: isLoggedIn ? { id: ADMIN_PROFILE.id, email: ADMIN_PROFILE.email } : null,
        profile: isLoggedIn ? ADMIN_PROFILE : null,
        role: isLoggedIn ? 'admin' : null,
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
