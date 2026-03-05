import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NewConsultation from "./pages/NewConsultation";
import Patients from "./pages/Patients";
import ConditionsLibrary from "./pages/ConditionsLibrary";
import ConditionDetail from "./pages/ConditionDetail";
import PrescribingLog from "./pages/PrescribingLog";
import Audit from "./pages/Audit";
import SettingsPage from "./pages/Settings";
import CalculatorsPage from "./pages/Calculators";
import ClaimsPage from "./pages/Claims";
import PPASettingsPage from "./pages/PPASettings";
import EightCpaDashboard from "./pages/EightCpaDashboard";
import EightCpaNewService from "./pages/EightCpaNewService";
import EightCpaServiceHistory from "./pages/EightCpaServiceHistory";
import PatientTriage from "./pages/PatientTriage";
import ProtocolConsultation from "./pages/ProtocolConsultation";
import TravelConsultation from "./pages/TravelConsultation";
import CalendarPage from "./pages/CalendarPage";
import BookingPage from "./pages/BookingPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import ScribePage from "./pages/ScribePage";
import PatientMessaging from "./pages/PatientMessaging";
import PbsLookup from "./pages/PbsLookup";
import ClaimsDemo from "./pages/ClaimsDemo";
import FhirDemo from "./pages/FhirDemo";
import IntegrationSettings from "./pages/IntegrationSettings";
import CommunicationsPage from "./pages/CommunicationsPage";
import ReportsPage from "./pages/ReportsPage";
import VaccinationEncounters from "./pages/VaccinationEncounters";
import PharmacySettings from "./pages/settings/PharmacySettings";
import ServicesSettings from "./pages/settings/ServicesSettings";
import VaccinesSettings from "./pages/settings/VaccinesSettings";
import RoomsSettings from "./pages/settings/RoomsSettings";
import StaffSettings from "./pages/settings/StaffSettings";
import ConsentFormsSettings from "./pages/settings/ConsentFormsSettings";
import CommunicationsSettings from "./pages/settings/CommunicationsSettings";
import IntegrationsSettings from "./pages/settings/IntegrationsSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, errorElement: <ErrorBoundary><NotFound /></ErrorBoundary> },

  // Main 6 sidebar routes
  { path: "/vaccination/calendar", element: <CalendarPage /> },
  { path: "/patients", element: <Patients /> },
  { path: "/vaccination/encounters", element: <VaccinationEncounters /> },
  { path: "/communications", element: <CommunicationsPage /> },
  { path: "/reports", element: <ReportsPage /> },

  // Settings hub + sub-pages
  { path: "/settings", element: <SettingsPage /> },
  { path: "/settings/pharmacy", element: <PharmacySettings /> },
  { path: "/settings/services", element: <ServicesSettings /> },
  { path: "/settings/vaccines", element: <VaccinesSettings /> },
  { path: "/settings/rooms", element: <RoomsSettings /> },
  { path: "/settings/staff", element: <StaffSettings /> },
  { path: "/settings/consent-forms", element: <ConsentFormsSettings /> },
  { path: "/settings/communications", element: <CommunicationsSettings /> },
  { path: "/settings/integrations", element: <IntegrationsSettings /> },

  // Existing routes preserved (not in sidebar but still reachable)
  { path: "/dashboard", element: <Index /> },
  { path: "/consultation", element: <NewConsultation /> },
  { path: "/conditions", element: <ConditionsLibrary /> },
  { path: "/conditions/:id", element: <ConditionDetail /> },
  { path: "/prescribing-log", element: <PrescribingLog /> },
  { path: "/audit", element: <Audit /> },
  { path: "/calculators", element: <CalculatorsPage /> },
  { path: "/claims", element: <ClaimsPage /> },
  { path: "/ppa-settings", element: <PPASettingsPage /> },
  { path: "/eight-cpa", element: <EightCpaDashboard /> },
  { path: "/eight-cpa/new", element: <EightCpaNewService /> },
  { path: "/eight-cpa/edit/:id", element: <EightCpaNewService /> },
  { path: "/eight-cpa/history", element: <EightCpaServiceHistory /> },
  { path: "/triage", element: <PatientTriage /> },
  { path: "/protocol-consultation", element: <ProtocolConsultation /> },
  { path: "/travel-consultation", element: <TravelConsultation /> },
  { path: "/book/:pharmacySlug", element: <BookingPage /> },
  { path: "/admin/settings", element: <AdminSettingsPage /> },
  { path: "/scribe", element: <ScribePage /> },
  { path: "/messaging", element: <PatientMessaging /> },
  { path: "/pbs-lookup", element: <PbsLookup /> },
  { path: "/claims-demo", element: <ClaimsDemo /> },
  { path: "/fhir-demo", element: <FhirDemo /> },
  { path: "/integration-settings", element: <IntegrationSettings /> },

  // Redirects for old routes
  { path: "/calendar", element: <Navigate to="/vaccination/calendar" replace /> },

  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
