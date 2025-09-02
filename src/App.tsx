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
import CreateReport from "./pages/CreateReport";
import Settings from "./pages/Settings";
import UserSettings from "./pages/UserSettings";
import EnterpriseView from "./pages/EnterpriseView";
import EnterpriseOrganizations from "./pages/EnterpriseOrganizations";
import EnterpriseAdmins from "./pages/EnterpriseAdmins";
import EnterpriseNotificationCenter from "./pages/EnterpriseNotificationCenter";
import EnterpriseLogs from "./pages/EnterpriseLogs";
import PlatformNotificationCenter from "./pages/PlatformNotificationCenter";

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
            <Route path="/organization/:id" element={<AccountDetail />} />
            <Route path="/organization/:id/mission-control" element={<MissionControl />} />
            <Route path="/organization/:id/team-directory" element={<TeamDirectory />} />
            <Route path="/organization/:id/locations" element={<Locations />} />
          <Route path="/organization/:id/equipment" element={<Equipment />} />
          <Route path="/organization/:id/reports/create/:templateId" element={<CreateReport />} />
          <Route path="/organization/:id/reports" element={<OrganizationReports />} />
          <Route path="/organization/:id/logs" element={<OrganizationLogs />} />
            <Route path="/organization/:id/settings" element={<Settings />} />
            <Route path="/enterprises/:id/enterprise-view" element={<EnterpriseView />} />
            <Route path="/enterprises/:id/organizations" element={<EnterpriseOrganizations />} />
            <Route path="/enterprises/:id/enterprise-admins" element={<EnterpriseAdmins />} />
            <Route path="/enterprises/:id/notifications" element={<EnterpriseNotificationCenter />} />
            <Route path="/enterprises/:id/logs" element={<EnterpriseLogs />} />
            <Route path="/enterprises/:id/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admins" element={<PlatformAdmins />} />
            <Route path="/notifications" element={<PlatformNotificationCenter />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<UserSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
