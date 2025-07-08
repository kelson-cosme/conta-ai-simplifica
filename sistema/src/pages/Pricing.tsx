// sistema/src/pages/Pricing.tsx
import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PricingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTrial, setIsLoadingTrial] = useState(false);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserStatus(profile.subscription_status);
      }
    };
    checkUserStatus();
  }, []);

  const handleFreeTrial = async () => {
    // ... (código do trial continua igual)
  };

  const handleSubscriptionCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!cpfCnpj) {
      toast({ title: "Campo obrigatório", description: "O CPF/CNPJ é necessário.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setIsDialogVisible(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Usuário não encontrado", description: "Faça o login para continuar.", variant: "destructive" });
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          userId: user.id,
          userEmail: user.email,
          cpfCnpj: cpfCnpj // Enviando o CPF/CNPJ do pop-up
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error("URL de pagamento não recebida.");

      window.location.href = data.url;

    } catch (error: any) {
      toast({
        title: "Erro ao processar assinatura",
        description: error.message || "Houve um problema ao criar sua assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubscribed = userStatus === 'active' || userStatus === 'trialing';

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Planos Flexíveis para Você</h1>
          <p className="text-lg text-muted-foreground mt-2">Escolha o plano que melhor se adapta às suas necessidades.</p>
        </div>

        {isSubscribed && (
          <Card className="mb-8 bg-green-50 border-green-200 w-full max-w-md">
            {/* ... (Card de plano ativo continua igual) ... */}
          </Card>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isSubscribed ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Card do Plano Gratuito */}
          <Card className="flex flex-col">
            {/* ... (Card de teste continua igual) ... */}
          </Card>

          {/* Card do Plano Pago */}
          <Card className="border-blue-500 flex flex-col">
            <CardHeader>
              <CardTitle>Plano Mensal</CardTitle>
              <CardDescription><span className="text-4xl font-bold">R$ 40,00</span><span className="text-muted-foreground"> / mês</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                  <li className="flex items-center"><Rocket className="h-4 w-4 mr-2 text-blue-500" /> Todas as funcionalidades do plano teste</li>
                  <li className="flex items-center"><Rocket className="h-4 w-4 mr-2 text-blue-500" /> Acesso contínuo e ilimitado</li>
                  <li className="flex items-center"><Rocket className="h-4 w-4 mr-2 text-blue-500" /> Suporte prioritário</li>
              </ul>
            </CardContent>
            <CardFooter>
              {/* Este botão agora abre o pop-up */}
              <Button onClick={() => setIsDialogVisible(true)} className="w-full" disabled={isSubmitting || isSubscribed}>
                Assinar Agora
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Pop-up (Dialog) para coletar o CPF/CNPJ */}
      <AlertDialog open={isDialogVisible} onOpenChange={setIsDialogVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Para continuar, por favor, informe seu CPF ou CNPJ. Este dado é exigido pelo nosso parceiro de pagamentos (Asaas).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubscriptionCheckout}>
            <div className="space-y-2 py-4">
              <Label htmlFor="cpfCnpj-dialog">CPF ou CNPJ</Label>
              <Input
                id="cpfCnpj-dialog"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="Apenas números"
                required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar para Pagamento"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PricingPage;
