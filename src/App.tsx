import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import ActivateAccount from "@/pages/ActivateAccount";
import ResetPassword from "@/pages/ResetPassword";
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
import Incidents from "./pages/Incidents";
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
import ResponderDashboard from "./pages/ResponderDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/activate" element={<ActivateAccount />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/organization/:id" element={<ProtectedRoute requireAssignment accountType="Organization"><AccountDetail /></ProtectedRoute>} />
            <Route path="/organization/:id/mission-control" element={<ProtectedRoute requireAssignment accountType="Organization"><MissionControl /></ProtectedRoute>} />
            <Route path="/organization/:id/responder-dashboard" element={<ProtectedRoute requireAssignment accountType="Organization"><ResponderDashboard /></ProtectedRoute>} />
            <Route path="/organization/:id/team-directory" element={<ProtectedRoute requireAssignment accountType="Organization"><TeamDirectory /></ProtectedRoute>} />
            <Route path="/organization/:id/locations" element={<ProtectedRoute requireAssignment accountType="Organization"><Locations /></ProtectedRoute>} />
          <Route path="/organization/:id/equipment" element={<ProtectedRoute requireAssignment accountType="Organization"><Equipment /></ProtectedRoute>} />
          <Route path="/organization/:id/incidents" element={<ProtectedRoute requireAssignment accountType="Organization"><Incidents /></ProtectedRoute>} />
          <Route path="/organization/:id/reports/create/:templateId" element={<ProtectedRoute requireAssignment accountType="Organization"><CreateReport /></ProtectedRoute>} />
          <Route path="/organization/:id/reports" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationReports /></ProtectedRoute>} />
          <Route path="/organization/:id/logs" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationLogs /></ProtectedRoute>} />
            <Route path="/organization/:id/settings" element={<ProtectedRoute requireAssignment accountType="Organization"><Settings /></ProtectedRoute>} />
            <Route path="/enterprises/:id/enterprise-view" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseView /></ProtectedRoute>} />
            <Route path="/enterprises/:id/organizations" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseOrganizations /></ProtectedRoute>} />
            <Route path="/enterprises/:id/enterprise-admins" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseAdmins /></ProtectedRoute>} />
            <Route path="/enterprises/:id/notifications" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseNotificationCenter /></ProtectedRoute>} />
            <Route path="/enterprises/:id/logs" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseLogs /></ProtectedRoute>} />
            <Route path="/enterprises/:id/settings" element={<ProtectedRoute requireAssignment accountType="Enterprise"><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admins" element={<PlatformAdmins />} />
            <Route path="/notifications" element={<PlatformNotificationCenter />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<UserSettings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
