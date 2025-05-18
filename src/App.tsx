
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="/pharmacists" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Pharmacists />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/pending" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Pending />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/completed" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Completed />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/expiring" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Expiring />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
