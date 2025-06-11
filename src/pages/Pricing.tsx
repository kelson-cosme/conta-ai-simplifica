// src/pages/Pricing.tsx

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PricingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscription = async () => {
    setIsLoading(true);
    try {
      // Chama a nossa Edge Function para criar a sessão de checkout
      const { data, error } = await supabase.functions.invoke('create-checkout-session');

      if (error) throw error;

      // Redireciona o usuário para a página de pagamento do Stripe
      window.location.href = data.url;

    } catch (error: any) {
      toast({
        title: "Erro ao iniciar assinatura",
        description: error.message || "Não foi possível redirecionar para o pagamento. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Selecione o seu plano</h1>
        <p className="text-lg text-gray-600 mt-2">Acesso completo à plataforma para simplificar sua contabilidade.</p>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Plano Mensal</CardTitle>
          <CardDescription>
            <span className="text-4xl font-bold">R$ 29,90</span>
            <span className="text-muted-foreground"> / mês</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Processamento ilimitado de NF-e</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Relatórios Automatizados</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Assistente com Inteligência Artificial</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Suporte Prioritário</li>
          </ul>
          <Button className="w-full" size="lg" onClick={handleSubscription} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assinar Agora'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingPage;