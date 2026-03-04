import {
  LayoutDashboard,
  CalendarDays,
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
  Mic,
  ChevronDown,
} from 'lucide-react';
import logoImg from '@/assets/chemistcare-logo.png';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  {
    title: 'New Consultation',
    url: '/consultation',
    icon: FilePlus,
    children: [
      { title: 'Travel Medicine', url: '/travel-consultation', icon: Plane },
    ],
  },
  { title: 'Protocol Consult', url: '/protocol-consultation', icon: Stethoscope },
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'Conditions Library', url: '/conditions', icon: BookOpen },
  { title: 'Prescribing Log', url: '/prescribing-log', icon: ClipboardList },
  { title: 'Calculators', url: '/calculators', icon: Calculator },
  { title: 'Clinical Scribe', url: '/scribe', icon: Mic },
  { title: 'Claims & Reporting', url: '/claims', icon: Receipt },
  { title: '8CPA / PPA Services', url: '/eight-cpa', icon: HeartPulse },
];

const adminItems = [
  { title: 'Audit', url: '/audit', icon: Shield },
  { title: 'PPA Integration', url: '/ppa-settings', icon: Receipt },
  { title: 'Practice Settings', url: '/admin/settings', icon: Settings },
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
              <span className="text-[0.625rem] font-bold text-sidebar-foreground/50 tracking-tight uppercase">Prescriber<span className="text-sidebar-primary">OS</span></span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.6875rem] font-medium tracking-wider text-sidebar-foreground/40 uppercase">Clinical</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) =>
                item.children ? (
                  <Collapsible key={item.title} defaultOpen={isActive(item.url) || item.children.some(c => isActive(c.url))} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isActive(item.url) && !item.children.some(c => isActive(c.url))}>
                          <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground" className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span className="text-[0.875rem]">{item.title}</span>}
                          </NavLink>
                          {!collapsed && <ChevronDown className="h-3.5 w-3.5 ml-auto shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(child.url)}>
                                <NavLink to={child.url} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                                  <child.icon className="h-3.5 w-3.5" />
                                  {!collapsed && <span className="text-[0.8125rem]">{child.title}</span>}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end={item.url === '/dashboard'} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="text-[0.875rem]">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
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
