import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { router } from './routes';
import { useEffect } from 'react';
import { AssistantService } from '@/services/AssistantService';
import { useAssistantStore } from '@/stores/assistantStore';
import './index.css';

const queryClient = new QueryClient();

function AppProviders() {
  const setAssistantService = useAssistantStore((state) => state.setService);

  useEffect(() => {
    const assistantService = new AssistantService("lexai", "wss://api.asystent-prawny.pl", {
      debug: process.env.NODE_ENV === "development"
    });

    setAssistantService(assistantService);

    return () => {
      assistantService.disconnect();
    };
  }, [setAssistantService]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AppProviders />);
