// src/pages/Pricing.tsx
import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';

// ADICIONADO: Defina o ID do seu plano do Stripe aqui.
// É uma boa prática usar variáveis de ambiente para isso.
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'seu_price_id_padrão';


const PricingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);

  const handleSignUpAndSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Tenta cadastrar o usuário
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // 2. Se o cadastro for bem-sucedido e o usuário estiver logado, prossiga para o checkout
      if (data.user && data.session) {
         await handleSubscriptionCheckout();
      } else {
        // Se o email de confirmação for necessário
        toast({
          title: "Verifique seu e-mail",
          description: "Um link de confirmação foi enviado. Após confirmar, volte e clique em 'Assinar Agora'.",
        });
      }

    } catch (error: any) {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Ocorreu um erro ao criar a conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubscriptionCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Você não está logado", description: "Por favor, crie uma conta ou faça login para assinar.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // MODIFICADO: Passa o priceId no corpo da requisição
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: STRIPE_PRICE_ID },
      });

      if (error) throw error;
      
      window.location.href = data.url;

    } catch (error: any) {
      toast({
        title: "Erro ao iniciar assinatura",
        description: error.message || "Não foi possível redirecionar para o pagamento.",
        variant: "destructive",
      });
    } finally {
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

          {!currentUser ? (
            <form onSubmit={handleSignUpAndSubscribe} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta e Assinar'}
              </Button>
               <div className="text-center">
                <Button variant="link" onClick={() => navigate('/')} className="text-sm">
                  Já tem uma conta? Faça login
                </Button>
              </div>
            </form>
          ) : (
            <Button className="w-full" size="lg" onClick={handleSubscriptionCheckout} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assinar Agora'}
            </Button>
          )}

        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Ao assinar, você concorda com nossos <Link to="/terms" className="underline ml-1">Termos de Serviço</Link>.
        </CardFooter>
      </Card>
    </div>
  );
};

export default PricingPage;