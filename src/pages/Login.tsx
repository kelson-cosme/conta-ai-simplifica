// src/pages/Login.tsx
import { FormEvent, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao sistema!",
      });
      // Redirecionamento será tratado pelo AuthWrapper
    } catch (error: any) {
      toast({
        title: "Erro no Login",
        description: error.message || "Ocorreu um erro inesperado ao fazer login.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Entrar no Sistema</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isAuthenticating}>
              {isAuthenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" asChild className="text-sm">
              <Link to="/pricing">Não tem conta? Crie uma aqui</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;