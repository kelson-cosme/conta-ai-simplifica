import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NFEData } from '@/lib/nfe-parser';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface INFEDataContext {
  nfeList: NFEData[];
  isLoading: boolean;
  saveNFE: (nfeData: NFEData) => Promise<boolean>;
  deleteNFE: (id: string) => Promise<boolean>;
  refreshNFEs: () => void;
}

const NFEDataContext = createContext<INFEDataContext | undefined>(undefined);

export const NFEDataProvider = ({ children }: { children: ReactNode }) => {
  const [nfeList, setNfeList] = useState<NFEData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNFEs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('nfe_data').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const transformedData: NFEData[] = data.map(item => ({
          id: item.id,
          numero: item.numero,
          serie: item.serie,
          dataEmissao: item.data_emissao,
          tipo: item.tipo as 'entrada' | 'saida',
          chaveAcesso: item.chave_acesso,
          protocolo: item.protocolo || undefined,
          status: item.status as NFEData['status'],
          emitente: item.emitente as any,
          destinatario: item.destinatario as any,
          produtos: item.produtos as any,
          totais: item.totais as any,
          transportadora: item.transportadora as any,
          observacoes: item.observacoes || undefined
        }));
        setNfeList(transformedData);
      }
    } catch (error) {
      console.error('Error fetching NFEs:', error);
      toast({ title: "Erro ao carregar NF-e", description: "Não foi possível carregar as notas fiscais.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveNFE = async (nfeData: NFEData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para salvar NFe.", variant: "destructive" });
        return false;
      }
      const { error } = await supabase.from('nfe_data').insert({
        user_id: user.id, numero: nfeData.numero, serie: nfeData.serie, data_emissao: nfeData.dataEmissao, tipo: nfeData.tipo,
        chave_acesso: nfeData.chaveAcesso, protocolo: nfeData.protocolo, status: nfeData.status, emitente: nfeData.emitente,
        destinatario: nfeData.destinatario, produtos: nfeData.produtos, totais: nfeData.totais,
        transportadora: nfeData.transportadora, observacoes: nfeData.observacoes
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: "Nota Fiscal Duplicada", description: `A NF-e número ${nfeData.numero} já existe no sistema.` });
        } else {
          throw error;
        }
        return false;
      }
      toast({ title: "NF-e Salva", description: `NF-e ${nfeData.numero} foi salva com sucesso.` });
      return true;
    } catch (error: any) {
      console.error('Error saving NFE:', error);
      toast({ title: "Erro ao Salvar", description: error.message || "Não foi possível salvar a NF-e.", variant: "destructive" });
      return false;
    }
  };

  const deleteNFE = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('nfe_data').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "NF-e Removida", description: "A nota fiscal foi removida com sucesso." });
      return true;
    } catch (error) {
      console.error('Error deleting NFE:', error);
      toast({ title: "Erro ao Remover", description: "Não foi possível remover a NF-e.", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchNFEs();

    const channelName = 'nfe_data_changes';
    let channel = supabase.channel(channelName);

    // Função de limpeza para garantir que a subscrição seja removida
    const cleanup = () => {
      if (channel) {
        supabase.removeChannel(channel).catch(err => {
          console.error("Erro ao remover canal:", err)
        });
      }
    };
    
    // Remove qualquer canal antigo antes de começar
    cleanup();
    
    // Cria um novo canal
    channel = supabase.channel(channelName);
    
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nfe_data' }, (payload) => {
        fetchNFEs();
      })
      .subscribe((status, err) => {
        if (err) {
          console.error(`Erro na subscrição do canal ${channelName}:`, err);
        }
      });

    return () => {
      cleanup();
    };
  }, [fetchNFEs]);

  const value = { nfeList, isLoading, saveNFE, deleteNFE, refreshNFEs: fetchNFEs };

  return <NFEDataContext.Provider value={value}>{children}</NFEDataContext.Provider>;
};

export const useNFE = (): INFEDataContext => {
  const context = useContext(NFEDataContext);
  if (context === undefined) {
    throw new Error('useNFE deve ser usado dentro de um NFEDataProvider');
  }
  return context;
};