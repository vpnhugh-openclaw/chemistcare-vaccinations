import {
  LayoutDashboard,
  FilePlus,
  Users,
  BookOpen,
  ClipboardList,
  Shield,
  Settings,
  Calculator,
  Receipt,
  HeartPulse,
  Stethoscope,
  UserCheck,
  Plane,
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'New Consultation', url: '/consultation', icon: FilePlus },
  { title: 'Protocol Consult', url: '/protocol-consultation', icon: Stethoscope },
  { title: 'Travel Medicine', url: '/travel-consultation', icon: Plane },
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'Conditions Library', url: '/conditions', icon: BookOpen },
  { title: 'Prescribing Log', url: '/prescribing-log', icon: ClipboardList },
  { title: 'Calculators', url: '/calculators', icon: Calculator },
  { title: 'Claims & Reporting', url: '/claims', icon: Receipt },
  { title: '8CPA / PPA Services', url: '/eight-cpa', icon: HeartPulse },
];

const adminItems = [
  { title: 'Audit', url: '/audit', icon: Shield },
  { title: 'PPA Integration', url: '/ppa-settings', icon: Receipt },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const patientFacingItems = [
  { title: 'Patient Triage', url: '/triage', icon: UserCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="ChemistCare Logo" className="h-8 w-8 rounded-lg object-cover" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[0.8125rem] font-bold text-sidebar-accent-foreground tracking-tight leading-tight">ChemistCare</span>
              <span className="text-[0.625rem] text-sidebar-foreground/50 font-medium tracking-widest uppercase">PrescriberOS</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.6875rem] font-medium tracking-wider text-sidebar-foreground/40 uppercase">Clinical</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === '/'} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[0.875rem]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.6875rem] font-medium tracking-wider text-sidebar-foreground/40 uppercase">Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[0.875rem]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.6875rem] font-medium tracking-wider text-sidebar-foreground/40 uppercase">Patient-Facing</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientFacingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[0.875rem]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="text-[0.625rem] text-sidebar-foreground/30 leading-relaxed">
            <p>Australian Pharmacist Prescriber</p>
            <p>Clinical Decision Support v1.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
