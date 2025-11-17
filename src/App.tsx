
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import { DashboardView } from "./components/admin/DashboardView";
import { UsersView } from "./components/admin/UsersView";
import { LawyersView } from "./components/admin/LawyersView";
import { PackagesView } from "./components/admin/PackagesView";
import { AssistantService } from "./services/AssistantService";
import { useAssistantStore } from "./stores/assistantStore";

const queryClient = new QueryClient();

const App = () => {
  const setAssistantService = useAssistantStore((state) => state.setService);

  useEffect(() => {
    // Initialize the AssistantService with production endpoint
    // Replace with your actual production endpoint
    const assistantService = new AssistantService("lexai", "wss://api.asystent-prawny.pl", {
      debug: process.env.NODE_ENV === "development"
    });
    
    // Store the service instance in Zustand
    setAssistantService(assistantService);
    
    // Cleanup function
    return () => {
      assistantService.disconnect();
    };
  }, [setAssistantService]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/dashboard/:userId" element={<Index />} />
            <Route path="/admin" element={<Admin />}>
              <Route index element={<DashboardView />} />
              <Route path="users" element={<UsersView />} />
              <Route path="lawyers" element={<LawyersView />} />
              <Route path="packages" element={<PackagesView />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
