'use client';

// Re-export useAuth from the SupabaseProvider for consistency
// All components should use this single source of truth
export { useAuth } from '@/providers/auth-provider';
