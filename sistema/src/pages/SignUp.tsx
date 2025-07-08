// sistema/src/pages/SignUp.tsx
import { FormEvent, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState(''); // <-- NOVO ESTADO
  const [plan, setPlan] = useState('trial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (plan === 'paid' && !cpfCnpj) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe seu CPF ou CNPJ para continuar.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { plan: plan } }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("A conta não pôde ser criada.");

      if (plan === 'trial') {
        toast({
          title: "Conta criada com sucesso!",
          description: "Enviamos um link de confirmação para o seu e-mail.",
        });
        navigate('/login');
      } else {
        toast({
          title: "Conta criada! Próximo passo: pagamento.",
          description: "Você será redirecionado para finalizar a assinatura.",
        });
        
        // Agora enviamos o CPF/CNPJ junto
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
            body: { 
              userId: authData.user.id, 
              userEmail: authData.user.email,
              cpfCnpj: cpfCnpj // <-- ENVIANDO O CPF/CNPJ
            } 
        });

        if (checkoutError) throw checkoutError;
        if (!checkoutData.url) throw new Error("Não foi possível obter o link de pagamento.");
        
        window.location.href = checkoutData.url;
      }
    } catch (error: any) {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Verifique seus dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar sua Conta</CardTitle>
          <CardDescription>É rápido e fácil. Vamos começar!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="•••••••• (mínimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <div className="space-y-3 pt-2">
              <Label>Escolha seu plano</Label>
              <RadioGroup defaultValue="trial" value={plan} onValueChange={setPlan}>
                 {/* ... Opções de Rádio ... */}
              </RadioGroup>
            </div>
            
            {/* CAMPO DE CPF/CNPJ CONDICIONAL */}
            {plan === 'paid' && (
              <div className="space-y-2 transition-all duration-300 ease-in-out">
                <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
                <Input id="cpfCnpj" type="text" placeholder="Seu CPF ou CNPJ" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required />
              </div>
            )}

            <Button type="submit" className="w-full !mt-6" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Conta e Continuar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" asChild className="text-sm">
              <Link to="/login">Já tem uma conta? Faça Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;