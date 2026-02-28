import { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProviderWrapper } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { PostHogProviderWrapper } from '@/providers/posthog-provider';
import { i18n, type Locale } from '@/lib/i18n-config';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata = {
  title: 'systm.re Platform',
  description:
    'The systm.re platform for managing clients, MVPs, and team collaboration.',
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({
    locale,
  }));
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50`}
      >
        <ThemeProviderWrapper>
          <AuthProvider>
            <PostHogProviderWrapper>
              {children}
              <Toaster />
            </PostHogProviderWrapper>
          </AuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
