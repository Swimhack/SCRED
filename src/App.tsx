
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/pharmacist-form" element={
            <DashboardLayout>
              <PharmacistForm />
            </DashboardLayout>
          } />
          <Route path="/pharmacists" element={
            <DashboardLayout>
              <Pharmacists />
            </DashboardLayout>
          } />
          <Route path="/pending" element={
            <DashboardLayout>
              <Pending />
            </DashboardLayout>
          } />
          <Route path="/completed" element={
            <DashboardLayout>
              <Completed />
            </DashboardLayout>
          } />
          <Route path="/expiring" element={
            <DashboardLayout>
              <Expiring />
            </DashboardLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
