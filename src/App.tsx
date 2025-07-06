
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import About from "./pages/About";
import Service from "./pages/Service";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import PharmacistForm from "./pages/PharmacistForm";
import Pharmacists from "./pages/Pharmacists";
import Pending from "./pages/Pending";
import Completed from "./pages/Completed";
import Expiring from "./pages/Expiring";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import MyApplications from "./pages/MyApplications";
import MyCredentials from "./pages/MyCredentials";
import MyExpiring from "./pages/MyExpiring";
import Profile from "./pages/Profile";
import LogsViewer from "./pages/LogsViewer";
import DevConsole from "./pages/DevConsole";
import AdminMessages from "./pages/AdminMessages";
import { useAppLogger } from "./hooks/useAppLogger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  useAppLogger(); // Initialize logging
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/pharmacist-form" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PharmacistForm />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Profile page */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin only routes */}
      <Route path="/pharmacists" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <Pharmacists />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/pending" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <Pending />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/completed" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <Completed />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/expiring" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardLayout>
            <Expiring />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Accessible to all authenticated users */}
      <Route path="/my-applications" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MyApplications />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/my-credentials" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MyCredentials />
          </DashboardLayout>
        </ProtectedRoute>
      } />
              <Route path="/my-expiring" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MyExpiring />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin-only routes */}
              <Route path="/logs" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <LogsViewer />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/dev-console" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <DevConsole />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin-messages" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout>
                    <AdminMessages />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
