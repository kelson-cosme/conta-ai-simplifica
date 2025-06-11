import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NFEData } from '@/lib/nfe-parser';
import { useToast } from '@/hooks/use-toast';

export const useNFEData = () => {
  const [nfeList, setNfeList] = useState<NFEData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNFEs = async () => {
    try {
      const { data, error } = await supabase
        .from('nfe_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Adicionada verificação para o caso de 'data' ser nulo
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
      toast({
        title: "Erro ao carregar NF-e",
        description: "Não foi possível carregar as notas fiscais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // MODIFICADO: A função saveNFE agora trata erros de duplicidade
  const saveNFE = async (nfeData: NFEData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para salvar NFe.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('nfe_data')
        .insert({
          user_id: user.id,
          numero: nfeData.numero,
          serie: nfeData.serie,
          data_emissao: nfeData.dataEmissao,
          tipo: nfeData.tipo,
          chave_acesso: nfeData.chaveAcesso,
          protocolo: nfeData.protocolo,
          status: nfeData.status,
          emitente: nfeData.emitente,
          destinatario: nfeData.destinatario,
          produtos: nfeData.produtos,
          totais: nfeData.totais,
          transportadora: nfeData.transportadora,
          observacoes: nfeData.observacoes
        });

      // ADICIONADO: Lógica para verificar o tipo de erro
      if (error) {
        // O código '23505' corresponde a uma violação de chave única (unique constraint)
        if (error.code === '23505') {
          toast({
            title: "Nota Fiscal Duplicada",
            description: `A NF-e número ${nfeData.numero} já existe no sistema.`,
            variant: "default", // Usamos o toast padrão para uma mensagem informativa
          });
        } else {
          // Para todos os outros erros, lançamos a exceção para ser tratada pelo bloco catch
          throw error;
        }
        return false; // Retorna falso em caso de duplicata
      }

      // Se não houver erro, atualiza a lista e mostra sucesso
      await fetchNFEs();
      
      toast({
        title: "NF-e Salva",
        description: `NF-e ${nfeData.numero} foi salva com sucesso.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error saving NFE:', error);
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar a NF-e.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateNFEStatus = async (id: string, status: NFEData['status']) => {
    try {
      const { error } = await supabase
        .from('nfe_data')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setNfeList(prev => 
        prev.map(nfe => nfe.id === id ? { ...nfe, status } : nfe)
      );

      return true;
    } catch (error) {
      console.error('Error updating NFE status:', error);
      return false;
    }
  };

  const deleteNFE = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nfe_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNfeList(prev => prev.filter(nfe => nfe.id !== id));
      
      toast({
        title: "NF-e Removida",
        description: "A nota fiscal foi removida com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting NFE:', error);
      toast({
        title: "Erro ao Remover",
        description: "Não foi possível remover a NF-e.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const channel = supabase.channel('realtime nfe_data');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'nfe_data' }, (payload) => {
      fetchNFEs();
    }).subscribe();

    fetchNFEs();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  return {
    nfeList,
    isLoading,
    saveNFE,
    updateNFEStatus,
    deleteNFE,
    refreshNFEs: fetchNFEs
  };
};