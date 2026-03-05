import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import {
  Building2,
  Stethoscope,
  Syringe,
  DoorOpen,
  UserCog,
  FileCheck,
  MessageSquare,
  Plug,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsSections = [
  { title: 'Pharmacy Details', url: '/settings/pharmacy', icon: Building2 },
  { title: 'Services', url: '/settings/services', icon: Stethoscope },
  { title: 'Vaccines', url: '/settings/vaccines', icon: Syringe },
  { title: 'Rooms', url: '/settings/rooms', icon: DoorOpen },
  { title: 'Staff', url: '/settings/staff', icon: UserCog },
  { title: 'Consent Forms', url: '/settings/consent-forms', icon: FileCheck },
  { title: 'Communications', url: '/settings/communications', icon: MessageSquare },
  { title: 'Integrations', url: '/settings/integrations', icon: Plug },
];

interface SettingsLayoutProps {
  children: ReactNode;
  title: string;
}

export function SettingsLayout({ children, title }: SettingsLayoutProps) {
  const location = useLocation();

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <NavLink to="/settings" className="hover:text-foreground transition-colors">Settings</NavLink>
          <span>›</span>
          <span className="text-foreground font-medium">{title}</span>
        </div>

        <div className="flex gap-6 max-w-6xl">
          {/* Left sub-nav */}
          <nav className="hidden md:flex flex-col w-52 shrink-0 space-y-0.5">
            {settingsSections.map((section) => {
              const active = location.pathname === section.url;
              return (
                <NavLink
                  key={section.url}
                  to={section.url}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-[0.8125rem] font-medium transition-colors',
                    active
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  {section.title}
                </NavLink>
              );
            })}
          </nav>

          {/* Right content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </ClinicalLayout>
  );
}

export { settingsSections };
