// // src/pages/Pricing.tsx
// import { useState, FormEvent, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Adicionado CardFooter
// import { Check, Loader2, Mail } from 'lucide-react'; // Adicionado Mail
// import { useToast } from '@/hooks/use-toast';
// import { Input } from '@/components/ui/input'; // Importado Input
// import { Label } from '@/components/ui/label'; // Importado Label
// import { Link, useNavigate } from 'react-router-dom'; // Importado Link e useNavigate

// const PricingPage = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSigningUp, setIsSigningUp] = useState(false); // Novo estado para controlar o formulário de cadastro
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState(''); // Mensagem para o usuário sobre o cadastro/confirmação
//   const { toast } = useToast();
//   const navigate = useNavigate(); // Hook para navegação programática

//   const handleAuthOrSubscription = async (e: FormEvent) => {
//     e.preventDefault();

//     if (isSigningUp) { // Se o formulário é de cadastro
//       setIsLoading(true);
//       setMessage('');
//       try {
//         const { data, error } = await supabase.auth.signUp({ email, password });

//         if (error) throw error;

//         // Se o email de confirmação é enviado, informe o usuário
//         if (data.user && !data.session) {
//           setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta e prosseguir com o pagamento.');
//           toast({
//             title: "Verifique seu e-mail",
//             description: "Um link de confirmação foi enviado para o seu endereço de e-mail.",
//           });
//         } else if (data.user && data.session) {
//           // Se não houver confirmação por email (ex: desativado no Supabase),
//           // ou se a sessão já for criada automaticamente, procede para o checkout.
//           // Idealmente, a confirmação de email deve ser forçada para novos cadastros.
//           await handleSubscriptionCheckout(); // Chama a função de checkout
//         }
//       } catch (error: any) {
//         toast({
//           title: "Erro no Cadastro",
//           description: error.message || "Ocorreu um erro ao criar a conta.",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     } else { // Se o formulário é de login (ou já está logado mas sem assinatura)
//       // Se o usuário já está logado (AuthWrapper já lidou com isso), ele clica
//       // no botão e vai direto para o checkout de assinatura.
//       // Se não está logado e chegou aqui, ele precisa se cadastrar primeiro,
//       // ou podemos adicionar uma opção de login.
//       await handleSubscriptionCheckout(); // Chama a função de checkout
//     }
//   };

//   const handleSubscriptionCheckout = async () => {
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase.functions.invoke('create-checkout-session');

//       if (error) throw error;

//       // Redireciona o usuário para a página de pagamento do Stripe
//       window.location.href = data.url;

//     } catch (error: any) {
//       toast({
//         title: "Erro ao iniciar assinatura",
//         description: error.message || "Não foi possível redirecionar para o pagamento. Tente novamente.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Verifica se o usuário já está logado para adaptar a UI
//   const [currentUser, setCurrentUser] = useState<any>(null);

//   useEffect(() => {
//     const checkUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       setCurrentUser(user);
//     };
//     checkUser();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
//       <div className="text-center mb-8">
//         <h1 className="text-4xl font-bold text-gray-800">Selecione o seu plano</h1>
//         <p className="text-lg text-gray-600 mt-2">Acesso completo à plataforma para simplificar sua contabilidade.</p>
//       </div>
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader>
//           <CardTitle>Plano Mensal</CardTitle>
//           <CardDescription>
//             <span className="text-4xl font-bold">R$ 29,90</span>
//             <span className="text-muted-foreground"> / mês</span>
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {!currentUser && ( // Exibe o formulário de cadastro/login se o usuário não estiver logado
//             <form onSubmit={handleAuthOrSubscription} className="space-y-4 mb-6">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password">Senha</Label>
//                 <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
//               </div>
//               {message && <p className="text-sm text-green-600 flex items-center gap-1"><Mail className="h-4 w-4" />{message}</p>}
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Cadastrar e Pagar'}
//               </Button>
//               <div className="text-center">
//                 <Button variant="link" onClick={() => navigate('/login')} className="text-sm">
//                   Já tem uma conta? Faça login
//                 </Button>
//               </div>
//             </form>
//           )}

//           {currentUser && ( // Se o usuário já está logado, mostra apenas o botão de assinatura
//             <>
//               <p className="text-sm text-center mb-4 text-muted-foreground">
//                 Você está logado como **{currentUser.email}**. Prossiga para ativar sua assinatura.
//               </p>
//             </>
//           )}

//           <ul className="space-y-3 mb-6">
//             <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Processamento ilimitado de NF-e</li>
//             <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Relatórios Automatizados</li>
//             <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Assistente com Inteligência Artificial</li>
//             <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Suporte Prioritário</li>
//           </ul>

//           {currentUser && ( // Botão de assinatura só se o usuário estiver logado
//             <Button className="w-full" size="lg" onClick={handleSubscriptionCheckout} disabled={isLoading}>
//               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assinar Agora'}
//             </Button>
//           )}
//         </CardContent>
//         {/* Adicione um footer para links como Termos de Serviço, Política de Privacidade, etc. */}
//         <CardFooter className="flex justify-center text-xs text-muted-foreground">
//           Ao clicar em "Assinar Agora", você concorda com nossos <Link to="/terms" className="underline ml-1">Termos de Serviço</Link>.
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default PricingPage;

// src/pages/Pricing.tsx
// Modificado para lidar com cadastro e direcionamento para pagamento Stripe
import { useState, FormEvent, useEffect } from 'react'; // Adicionado useEffect
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estado para verificar se o usuário já está logado
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true); // Novo estado para controlar o carregamento do usuário

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setLoadingUser(false);
    };
    checkUser();

    // Adiciona listener para mudanças de autenticação (ex: após magic link, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignUpAndCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // 1. Tentar fazer o cadastro
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) throw signUpError;

      // Se o email de confirmação é enviado, informe o usuário
      if (data.user && !data.session) {
        setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta e prosseguir com o pagamento.');
        toast({
          title: "Verifique seu e-mail",
          description: "Um link de confirmação foi enviado para o seu endereço de e-mail.",
        });
      } else if (data.user && data.session) {
        // Se a sessão já for criada automaticamente (e-mail não precisa de confirmação),
        // ou se o usuário já estiver logado (neste caso, este bloco não seria acessado por causa do `!currentUser` no JSX)
        // ou se o usuário acabou de confirmar o e-mail via magic link e foi redirecionado para cá,
        // então procedemos para o checkout.
        await handleSubscriptionCheckout();
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
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
          {!currentUser ? ( // Se o usuário não está logado, mostra o formulário de cadastro
            <form onSubmit={handleSignUpAndCheckout} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {message && <p className="text-sm text-green-600 flex items-center gap-1"><Mail className="h-4 w-4" />{message}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Cadastrar e Pagar'}
              </Button>
              <div className="text-center">
                <Button variant="link" onClick={() => navigate('/login')} className="text-sm">
                  Já tem uma conta? Faça login
                </Button>
              </div>
            </form>
          ) : ( // Se o usuário está logado, mostra apenas a opção de assinar
            <>
              <p className="text-sm text-center mb-4 text-muted-foreground">
                Você está logado como **{currentUser.email}**. Prossiga para ativar sua assinatura.
              </p>
              <Button className="w-full" size="lg" onClick={handleSubscriptionCheckout} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Assinar Agora'}
              </Button>
            </>
          )}

          <ul className="space-y-3 mb-6 mt-6"> {/* Ajustado margem para lista */}
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Processamento ilimitado de NF-e</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Relatórios Automatizados</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Assistente com Inteligência Artificial</li>
            <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" />Suporte Prioritário</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Ao clicar em "Assinar Agora", você concorda com nossos <Link to="/terms" className="underline ml-1">Termos de Serviço</Link>.
        </CardFooter>
      </Card>
    </div>
  );
};

export default PricingPage;