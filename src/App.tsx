// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PricingPage from "./pages/Pricing"; // Importe a página de precificação
import LoginPage from "./pages/Login"; // Importe a nova página de login
import { NFEDataProvider } from "./contexts/NFEDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NFEDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<PricingPage />} /> {/* Rota para a landing page/cadastro */}
            <Route path="/login" element={<LoginPage />} /> {/* Nova rota para login */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NFEDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;