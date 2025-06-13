// src/components/AuthWrapper.tsx

import { useEffect, useState, useCallback, ReactNode, FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import PricingPage from '@/pages/Pricing';
interface AuthWrapperProps {
  children: ReactNode;
}

type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | null;

const VerifyingPayment = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <h1 className="text-2xl font-bold text-gray-800">Verificando seu pagamento...</h1>
    <p className="text-lg text-gray-600 mt-2">Isso pode levar alguns segundos. Por favor, não feche esta página.</p>
  </div>
);

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success');
  const [isVerifying, setIsVerifying] = useState(!!paymentSuccess);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
      let error;
      if (isSignUp) {
        ({ error } = await supabase.auth.signUp({ email, password }));
      } else {
        ({ error } = await supabase.auth.signInWithPassword({ email, password }));
      }
useNavigate
      if (error) throw error;

      toast({
        title: isSignUp ? "Conta criada!" : "Login realizado!",
        description: isSignUp ? "Verifique seu email para confirmar a conta." : "Bem-vindo de volta!",
      });
    } catch (error: any) {
      toast({
        title: "Erro na autenticação",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const checkSubscription = useCallback(async (userId: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') { // Código para 'no rows found'
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId });

      if (insertError) {
        console.error("Erro ao criar novo perfil:", insertError);
        return;
      }
    } else if (error) {
      console.error("Erro ao buscar perfil:", error);
      return;
    }

    const currentStatus = (data?.subscription_status as SubscriptionStatus) || null;
    setSubscriptionStatus(currentStatus);

    // MODIFICADO: Agora aceita 'active' ou 'trialing' para parar a verificação
    if (currentStatus === 'active' || currentStatus === 'trialing') {
        setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);
        setLoading(true);
        if (currentUser) {
          checkSubscription(currentUser.id).finally(() => setLoading(false));
        } else {
          setSubscriptionStatus(null);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [checkSubscription]); //

  useEffect(() => {
    if (isVerifying && user) {
      const interval = setInterval(() => {
        checkSubscription(user.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isVerifying, user, checkSubscription]); //

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (isVerifying) {
    return <VerifyingPayment />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isSignUp ? 'Criar Conta' : 'Entrar'}</CardTitle>
            <CardDescription>{isSignUp ? 'Crie sua conta para começar' : 'Entre com sua conta'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isAuthenticating}>
                {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? <UserPlus className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />)}
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-sm">
                {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie uma aqui'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MODIFICADO: A verificação aqui também considera o status 'trialing' como válido
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
    return <PricingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-gray-900">Processador NFe</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Sair</Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AuthWrapper;