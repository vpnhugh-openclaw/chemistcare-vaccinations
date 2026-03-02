import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/consultation" element={<NewConsultation />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/conditions" element={<ConditionsLibrary />} />
            <Route path="/conditions/:id" element={<ConditionDetail />} />
            <Route path="/prescribing-log" element={<PrescribingLog />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/calculators" element={<CalculatorsPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/ppa-settings" element={<PPASettingsPage />} />
            <Route path="/eight-cpa" element={<EightCpaDashboard />} />
            <Route path="/eight-cpa/new" element={<EightCpaNewService />} />
            <Route path="/eight-cpa/edit/:id" element={<EightCpaNewService />} />
            <Route path="/eight-cpa/history" element={<EightCpaServiceHistory />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
