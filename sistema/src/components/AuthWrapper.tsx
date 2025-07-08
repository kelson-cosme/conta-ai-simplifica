// sistema/src/components/AuthWrapper.tsx
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ['/', '/login', '/signup', '/pricing'];

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          console.log("AuthWrapper: Auth state changed. Current path:", location.pathname);

          if (!session) {
            console.log("AuthWrapper: No session found.");
            if (!publicRoutes.includes(location.pathname)) {
              console.log("AuthWrapper: Not a public route, redirecting to /login.");
              navigate("/login");
            }
            // É importante parar a execução aqui se não houver sessão
            setLoading(false);
            return;
          }

          console.log("AuthWrapper: Session found. Fetching profile for user:", session.user.id);
          
          // CORREÇÃO: Adicionado um timeout para a consulta do perfil
          // Isto previne que a aplicação fique presa se a consulta ao DB não responder.
          const profilePromise = supabase
            .from('profiles')
            .select('subscription_status, trial_expires_at')
            .eq('id', session.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('A busca pelo perfil demorou muito (timeout).')), 5000)
          );

          // A Promise que terminar primeiro (a busca ou o timeout) vence.
          const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as { data: any, error: any };

          if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar perfil: ${error.message}`);
          }
          console.log("AuthWrapper: Profile status:", profile?.subscription_status);

          const status = profile?.subscription_status;
          const trialExpiresAt = profile?.trial_expires_at ? new Date(profile.trial_expires_at) : null;
          const isTrialExpired = trialExpiresAt && trialExpiresAt < new Date();

          const isAuthorized = status === 'active' || (status === 'trialing' && !isTrialExpired);
          console.log("AuthWrapper: O utilizador está autorizado?", isAuthorized);

          if (publicRoutes.includes(location.pathname)) {
            if (isAuthorized) {
              console.log("AuthWrapper: Utilizador autorizado em rota pública, redirecionando para /dashboard.");
              navigate("/dashboard");
            }
          } else {
            if (!isAuthorized) {
              console.log("AuthWrapper: Utilizador não autorizado em rota privada, redirecionando para /pricing.");
              navigate("/pricing");
            }
          }
        } catch (e: any) {
          console.error("AuthWrapper: Ocorreu um erro.", e);
          // Em caso de erro, desloga o utilizador e o envia para a tela de login para segurança
          await supabase.auth.signOut();
          navigate("/login");
        } finally {
          // Garante que a tela de carregamento seja removida, não importa o que aconteça
          console.log("AuthWrapper: Verificação finalizada, definindo loading como false.");
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}
