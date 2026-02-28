import { PortalHeader } from '@/components/layout/portal-header';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { PortalClientProvider } from '@/providers/portal-client-provider';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalClientProvider>
      <div className="flex flex-col h-screen">
        <PortalHeader />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
        <ThemeToggle />
      </div>
      </div>
    </PortalClientProvider>
  );
}
