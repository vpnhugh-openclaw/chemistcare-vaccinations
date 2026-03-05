import { Link } from 'react-router-dom';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Card, CardContent } from '@/components/ui/card';
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

const settingsCards = [
  { title: 'Pharmacy Details', description: 'Name, address, ABN, and pharmacy identifiers', url: '/settings/pharmacy', icon: Building2 },
  { title: 'Services', description: 'Configure available services and booking types', url: '/settings/services', icon: Stethoscope },
  { title: 'Vaccines', description: 'Manage vaccine brands, batches, and stock', url: '/settings/vaccines', icon: Syringe },
  { title: 'Rooms', description: 'Consultation rooms and capacity settings', url: '/settings/rooms', icon: DoorOpen },
  { title: 'Staff', description: 'Staff profiles, roles, and AHPRA details', url: '/settings/staff', icon: UserCog },
  { title: 'Consent Forms', description: 'Consent form templates and version control', url: '/settings/consent-forms', icon: FileCheck },
  { title: 'Communications', description: 'SMS templates, email settings, and follow-up rules', url: '/settings/communications', icon: MessageSquare },
  { title: 'Integrations', description: 'AIR reporting, PPA claiming, and external APIs', url: '/settings/integrations', icon: Plug },
];

const SettingsPage = () => (
  <ClinicalLayout>
    <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration and practice management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCards.map((card) => (
          <Link key={card.url} to={card.url} className="group">
            <Card className="h-full transition-shadow hover:shadow-md group-hover:border-accent/30">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <card.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </ClinicalLayout>
);

export default SettingsPage;
