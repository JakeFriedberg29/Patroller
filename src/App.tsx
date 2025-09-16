import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";

const Layout = lazy(() => import("@/components/Layout").then(m => ({ default: m.Layout })));
const Auth = lazy(() => import("@/pages/Auth"));
const ActivateAccount = lazy(() => import("@/pages/ActivateAccount"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Index = lazy(() => import("./pages/Index"));
const Accounts = lazy(() => import("./pages/Accounts"));
const AccountDetail = lazy(() => import("./pages/AccountDetail"));
const Reports = lazy(() => import("./pages/Reports"));
const PlatformAdmins = lazy(() => import("./pages/PlatformAdmins"));
const Logs = lazy(() => import("./pages/Logs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MissionControl = lazy(() => import("./pages/MissionControl"));
const TeamDirectory = lazy(() => import("./pages/TeamDirectory"));
const Locations = lazy(() => import("./pages/Locations"));
const Equipment = lazy(() => import("./pages/Equipment"));
const Incidents = lazy(() => import("./pages/Incidents"));
const OrganizationReports = lazy(() => import("./pages/OrganizationReports"));
const OrganizationLogs = lazy(() => import("./pages/OrganizationLogs"));
const CreateReport = lazy(() => import("./pages/CreateReport"));
const Settings = lazy(() => import("./pages/Settings"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const EnterpriseView = lazy(() => import("./pages/EnterpriseView"));
const EnterpriseOrganizations = lazy(() => import("./pages/EnterpriseOrganizations"));
const EnterpriseAdmins = lazy(() => import("./pages/EnterpriseAdmins"));
const EnterpriseNotificationCenter = lazy(() => import("./pages/EnterpriseNotificationCenter"));
const EnterpriseLogs = lazy(() => import("./pages/EnterpriseLogs"));
const PlatformNotificationCenter = lazy(() => import("./pages/PlatformNotificationCenter"));
const ResponderDashboard = lazy(() => import("./pages/ResponderDashboard"));
const Landing = lazy(() => import("./pages/Landing"));
const About = lazy(() => import("./pages/About"));
const Product = lazy(() => import("./pages/Product"));
const Customers = lazy(() => import("./pages/Customers"));
const Pricing = lazy(() => import("./pages/Pricing"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/product" element={<Product />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/pricing" element={<Pricing />} />
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
