import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NewConsultation from "./pages/NewConsultation";
import Patients from "./pages/Patients";
import ConditionsLibrary from "./pages/ConditionsLibrary";
import ConditionDetail from "./pages/ConditionDetail";
import PrescribingLog from "./pages/PrescribingLog";
import Audit from "./pages/Audit";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/consultation" element={<NewConsultation />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/conditions" element={<ConditionsLibrary />} />
          <Route path="/conditions/:id" element={<ConditionDetail />} />
          <Route path="/prescribing-log" element={<PrescribingLog />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
