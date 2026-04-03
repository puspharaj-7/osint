import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/lib/store";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { requestNotificationPermission } from "@/lib/notifications";
import { getDashboardPath } from "@/services/authService";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import ClientLayout from "./components/ClientLayout";
import Login from "./pages/Login";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// Role dashboards
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import InvestigatorDashboard from "./pages/investigator/InvestigatorDashboard";
import ClientPortal from "./pages/client/ClientPortal";

// Existing pages
import NewInvestigation from "./pages/NewInvestigation";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import GraphView from "./pages/GraphView";
import Alerts from "./pages/Alerts";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

/** Redirect /dashboard → role-specific dashboard */
function DashboardRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && profile) navigate(getDashboardPath(profile.role), { replace: true });
    else if (!loading && !profile) navigate('/', { replace: true });
  }, [profile, loading, navigate]);
  return null;
}

const App = () => {
  useEffect(() => { requestNotificationPermission(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* ── Public ── */}
                <Route path="/" element={<Login />} />
                <Route path="/forbidden" element={<Forbidden />} />

                {/* ── Smart redirect ── */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* ── Staff layout (admin / manager / investigator) ── */}
                <Route element={<AppLayout />}>
                  {/* Admin */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/panel" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  } />

                  {/* Manager */}
                  <Route path="/manager/dashboard" element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Investigator */}
                  <Route path="/investigator/dashboard" element={
                    <ProtectedRoute allowedRoles={['investigator']}>
                      <InvestigatorDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Shared staff routes */}
                  <Route path="/new-investigation" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'investigator']}>
                      <NewInvestigation />
                    </ProtectedRoute>
                  } />
                  <Route path="/cases" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'investigator']}>
                      <Cases />
                    </ProtectedRoute>
                  } />
                  <Route path="/cases/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'investigator']}>
                      <CaseDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/graph" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'investigator']}>
                      <GraphView />
                    </ProtectedRoute>
                  } />
                  <Route path="/alerts" element={
                    <ProtectedRoute allowedRoles={['admin', 'manager', 'investigator']}>
                      <Alerts />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* ── Client layout ── */}
                <Route element={<ClientLayout />}>
                  <Route path="/client/portal" element={
                    <ProtectedRoute allowedRoles={['client']}>
                      <ClientPortal />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* ── Fallback ── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
