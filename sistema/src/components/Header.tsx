// sistema/src/components/Header.tsx
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Header = () => {
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, trial_expires_at')
          .eq('id', user.id)
          .single();
        if (profile) {
          // Lógica para verificar se o trial expirou
          if (profile.subscription_status === 'trialing' && profile.trial_expires_at) {
            if (new Date(profile.trial_expires_at) < new Date()) {
              setUserStatus('trial_expired');
            } else {
              setUserStatus('trialing');
            }
          } else {
            setUserStatus(profile.subscription_status);
          }
        }
      }
    };

    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData();
      } else {
        setUserEmail(null);
        setUserStatus(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getStatusMessage = () => {
    switch (userStatus) {
      case 'trialing':
        return 'Você está em um período de teste gratuito.';
      case 'trial_expired':
        return 'Seu período de teste expirou. Assine para continuar.';
      case 'pending':
        return 'Pagamento pendente. Verifique seu e-mail.';
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <header className="bg-white shadow-sm">
      {statusMessage && (
        <div className="bg-yellow-100 text-center p-2 text-sm text-yellow-800 border-b border-yellow-200">
          {statusMessage}
          {userStatus === 'trial_expired' && <Button variant="link" className="p-0 ml-2 h-auto text-yellow-800" onClick={() => navigate('/pricing')}>Ver Planos</Button>}
        </div>
      )}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Conta AI Simplifica</h1>
        {userEmail && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">{userEmail}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};