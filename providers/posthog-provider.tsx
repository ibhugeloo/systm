'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function PostHogProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window._posthog_initialized) {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (posthogKey && posthogHost) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          capture_pageview: false,
        });

        posthog.capture('$pageview');
        window._posthog_initialized = true;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window._posthog_initialized) {
      posthog.capture('$pageview');
    }
  }, [pathname]);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}

declare global {
  interface Window {
    _posthog_initialized?: boolean;
  }
}
