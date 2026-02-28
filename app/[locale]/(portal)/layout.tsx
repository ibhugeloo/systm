import { PortalHeader } from '@/components/layout/portal-header';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <PortalHeader />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Theme and language switchers in a floating position */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
