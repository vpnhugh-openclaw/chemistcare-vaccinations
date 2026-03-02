import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Shield } from 'lucide-react';
import logoImg from '@/assets/logo.png';

interface ClinicalLayoutProps {
  children: ReactNode;
}

export function ClinicalLayout({ children }: ClinicalLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-card px-3 sm:px-4 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <SidebarTrigger className="text-muted-foreground" />
              <div className="h-4 w-px bg-border" />
              <img src={logoImg} alt="ChemistCare" className="h-6 w-6 rounded object-cover" />
              <div className="flex items-center gap-1">
                <span className="text-[0.75rem] font-bold text-foreground tracking-tight leading-none">ChemistCare</span>
                <span className="text-[0.75rem] font-bold tracking-tight leading-none">Prescriber<span className="text-accent">OS</span></span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <Shield className="h-3 w-3 text-accent" />
                <span className="text-[0.625rem] font-medium text-muted-foreground">Clinical Mode</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] text-muted-foreground hidden sm:inline">Jurisdiction: <span className="font-medium text-foreground">Victoria</span></span>
              <div className="h-1.5 w-1.5 rounded-full bg-clinical-safe" />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
