import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";
const Auth = lazy(() => import("@/pages/Auth"));
const ActivateAccount = lazy(() => import("@/pages/ActivateAccount"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const PersonaSelection = lazy(() => import("@/pages/PersonaSelection"));
const Index = lazy(() => import("./pages/Index"));
const Accounts = lazy(() => import("./pages/Accounts"));
const AccountDetail = lazy(() => import("./pages/AccountDetail"));
const Reports = lazy(() => import("./pages/Reports"));
const PlatformAdmins = lazy(() => import("./pages/PlatformAdmins"));
const Subtypes = lazy(() => import("./pages/Subtypes"));
const Logs = lazy(() => import("./pages/Logs"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OrganizationAnalytics = lazy(() => import("./pages/OrganizationAnalytics"));
const OrganizationUsers = lazy(() => import("./pages/OrganizationUsers"));
const OrganizationReports = lazy(() => import("./pages/OrganizationReports"));
const OrganizationLogs = lazy(() => import("./pages/OrganizationLogs"));
const CreateReport = lazy(() => import("./pages/CreateReport"));
const ReportDetail = lazy(() => import("./pages/ReportDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const EnterpriseAnalytics = lazy(() => import("./pages/EnterpriseAnalytics"));
const EnterpriseOrganizations = lazy(() => import("./pages/EnterpriseOrganizations"));
const EnterpriseUsers = lazy(() => import("./pages/EnterpriseUsers"));
const EnterpriseLogs = lazy(() => import("./pages/EnterpriseLogs"));
const Repository = lazy(() => import("./pages/Repository"));
const ReportBuilder = lazy(() => import("./pages/ReportBuilder"));
const PatrollerDashboard = lazy(() => import("./pages/PatrollerDashboard"));
const LicensesCatalog = lazy(() => import("./pages/LicensesCatalog"));
const Billing = lazy(() => import("./pages/Billing"));
const Styleguide = lazy(() => import("./pages/Styleguide"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/activate" element={<ActivateAccount />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/persona-selection" element={
                <ProtectedRoute>
                  <PersonaSelection />
                </ProtectedRoute>
              } />
              <Route path="/repository" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <Layout>
                      <Repository />
                    </Layout>
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <Layout>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route index element={<Index />} />
                          <Route path="accounts" element={<Accounts />} />
                          <Route path="organization/:id" element={<ProtectedRoute requireAssignment accountType="Organization"><AccountDetail /></ProtectedRoute>} />
                          <Route path="organization/:id/analytics" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationAnalytics /></ProtectedRoute>} />
                          <Route path="organization/:id/patroller-dashboard" element={<ProtectedRoute requireAssignment accountType="Organization"><PatrollerDashboard /></ProtectedRoute>} />
                          <Route path="organization/:id/users" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationUsers /></ProtectedRoute>} />
                          {/* Backward-compat: old Team Directory path */}
                          <Route path="organization/:id/team-directory" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationUsers /></ProtectedRoute>} />
                          {/* Incidents route removed */}
                          <Route path="organization/:id/reports/create/:templateId" element={<ProtectedRoute requireAssignment accountType="Organization"><CreateReport /></ProtectedRoute>} />
                          <Route path="organization/:id/reports" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationReports /></ProtectedRoute>} />
                          <Route path="organization/:id/logs" element={<ProtectedRoute requireAssignment accountType="Organization"><OrganizationLogs /></ProtectedRoute>} />
                          <Route path="organization/:id/licenses" element={<ProtectedRoute requireAssignment accountType="Organization"><LicensesCatalog /></ProtectedRoute>} />
                          <Route path="organization/:id/billing" element={<ProtectedRoute requireAssignment accountType="Organization"><Billing /></ProtectedRoute>} />
                          <Route path="organization/:id/settings" element={<ProtectedRoute requireAssignment accountType="Organization"><Settings /></ProtectedRoute>} />
                          <Route path="enterprises/:id/analytics" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseAnalytics /></ProtectedRoute>} />
                          <Route path="enterprises/:id/organizations" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseOrganizations /></ProtectedRoute>} />
                          <Route path="enterprises/:id/users" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseUsers /></ProtectedRoute>} />
                          {/* Backward-compat: old Enterprise Admins path */}
                          <Route path="enterprises/:id/enterprise-admins" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseUsers /></ProtectedRoute>} />
                          
                          <Route path="enterprises/:id/logs" element={<ProtectedRoute requireAssignment accountType="Enterprise"><EnterpriseLogs /></ProtectedRoute>} />
                          <Route path="enterprises/:id/licenses" element={<ProtectedRoute requireAssignment accountType="Enterprise"><LicensesCatalog /></ProtectedRoute>} />
                          <Route path="enterprises/:id/billing" element={<ProtectedRoute requireAssignment accountType="Enterprise"><Billing /></ProtectedRoute>} />
                          <Route path="enterprises/:id/settings" element={<ProtectedRoute requireAssignment accountType="Enterprise"><Settings /></ProtectedRoute>} />
                          <Route path="reports" element={<Reports />} />
                          <Route path="reports/:templateId" element={<ReportDetail />} />
                          <Route path="repository/reports/:templateId" element={<ReportBuilder />} />
                          <Route path="repository/reports/new" element={<ReportBuilder />} />
                          <Route path="admins" element={<PlatformAdmins />} />
                          <Route path="subtypes" element={<Subtypes />} />
                          <Route path="repository" element={<Repository />} />
                          <Route path="styleguide" element={<Styleguide />} />
                          <Route path="logs" element={<Logs />} />
                          <Route path="settings" element={<UserSettings />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  </Suspense>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
