import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="border-b border-border bg-background">
          <div className="flex items-center justify-end gap-4 px-6 py-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
