import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Accounts from "./pages/Accounts";
import AccountDetail from "./pages/AccountDetail";
import Reports from "./pages/Reports";
import PlatformAdmins from "./pages/PlatformAdmins";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import MissionControl from "./pages/MissionControl";
import TeamDirectory from "./pages/TeamDirectory";
import Locations from "./pages/Locations";
import Equipment from "./pages/Equipment";
import OrganizationReports from "./pages/OrganizationReports";
import OrganizationLogs from "./pages/OrganizationLogs";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/accounts/:id/mission-control" element={<MissionControl />} />
            <Route path="/accounts/:id/team-directory" element={<TeamDirectory />} />
            <Route path="/accounts/:id/locations" element={<Locations />} />
          <Route path="/accounts/:id/equipment" element={<Equipment />} />
          <Route path="/accounts/:id/reports" element={<OrganizationReports />} />
          <Route path="/accounts/:id/logs" element={<OrganizationLogs />} />
          <Route path="/accounts/:id/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admins" element={<PlatformAdmins />} />
            <Route path="/logs" element={<Logs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
