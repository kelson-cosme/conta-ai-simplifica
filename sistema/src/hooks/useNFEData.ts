import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
// MODIFICADO: Importamos os tipos detalhados para usar na asserção
import { type ParsedNota, type NFEData, type NFSEData } from '@/lib/nfe-parser';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedNota {
  id: string;
  docType: 'nfe' | 'nfse';
  numero: string;
  nomeEntidade: string;
  dataEmissao: string;
  valor: number;
  status: string;
  tipo?: 'entrada' | 'saida';
}

export const useNFEData = () => {
  const [notaList, setNotaList] = useState<UnifiedNota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotaList([]);
        setIsLoading(false);
        return;
      };

      const [nfeResponse, nfseResponse] = await Promise.all([
        supabase.from('nfe_data').select('*').eq('user_id', user.id),
        supabase.from('nfse_data').select('*').eq('user_id', user.id)
      ]);

      if (nfeResponse.error) throw nfeResponse.error;
      if (nfseResponse.error) throw nfseResponse.error;

      const nfeUnificadas: UnifiedNota[] = (nfeResponse.data || []).map(nfe => ({
        id: nfe.id,
        docType: 'nfe',
        numero: nfe.numero,
        // MODIFICADO: Usamos 'as' para dizer ao TS o formato do JSON
        nomeEntidade: (nfe.emitente as NFEData['emitente']).razaoSocial,
        dataEmissao: nfe.data_emissao,
        valor: (nfe.totais as NFEData['totais']).valorNota,
        status: nfe.status,
        tipo: nfe.tipo as 'entrada' | 'saida',
      }));

      const nfseUnificadas: UnifiedNota[] = (nfseResponse.data || []).map(nfse => ({
        id: nfse.id,
        docType: 'nfse',
        numero: nfse.numero,
        // MODIFICADO: Usamos 'as' para dizer ao TS o formato do JSON
        nomeEntidade: (nfse.prestador as NFSEData['prestador']).razaoSocial,
        dataEmissao: nfse.data_emissao,
        valor: (nfse.totais as NFSEData['totais']).valorTotalServicos,
        status: nfse.status,
      }));

      const todasAsNotas = [...nfeUnificadas, ...nfseUnificadas].sort(
        (a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()
      );
      
      setNotaList(todasAsNotas);

    } catch (error: any) {
      console.error('Erro ao carregar notas:', error);
      toast({ title: "Erro ao carregar notas", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Função genérica para salvar qualquer tipo de nota
  const saveNota = async (parsedNota: ParsedNota) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      let error;

      if (parsedNota.docType === 'nfe') {
        const nfe = parsedNota.data;
        const { error: insertError } = await supabase.from('nfe_data').insert({
          user_id: user.id,
          numero: nfe.numero,
          serie: nfe.serie,
          data_emissao: nfe.dataEmissao,
          tipo: nfe.tipo,
          chave_acesso: nfe.chaveAcesso,
          protocolo: nfe.protocolo,
          status: nfe.status,
          emitente: nfe.emitente,
          destinatario: nfe.destinatario,
          produtos: nfe.produtos,
          totais: nfe.totais,
          transportadora: nfe.transportadora,
          observacoes: nfe.observacoes,
        });
        error = insertError;
      } else if (parsedNota.docType === 'nfse') {
        const nfse = parsedNota.data;
        const { error: insertError } = await supabase.from('nfse_data').insert({
          user_id: user.id,
          numero: nfse.numero,
          codigo_verificacao: nfse.codigoVerificacao,
          data_emissao: nfse.dataEmissao,
          status: nfse.status,
          prestador: nfse.prestador,
          tomador: nfse.tomador,
          servicos: nfse.servicos,
          totais: nfse.totais, 
          observacoes: nfse.observacoes,
        });
        error = insertError;
      } else {
        throw new Error("Tipo de documento desconhecido para salvar.");
      }

      if (error) {
        if (error.code === '23505') {
          toast({ title: "Nota Fiscal Duplicada", description: "Esta nota já existe no sistema." });
        } else {
          throw error;
        }
        return false;
      }

      await fetchNotas();
      toast({ title: "Nota Fiscal Salva", description: `Documento foi salvo com sucesso.` });
      return true;

    } catch (error: any) {
      console.error('Erro ao salvar nota:', error);
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
      return false;
    }
  };

  // Função para deletar agora precisa saber a tabela de origem
  const deleteNota = async (id: string, docType: 'nfe' | 'nfse') => {
    try {
      let error;

      if (docType === 'nfe') {
        const { error: deleteError } = await supabase.from('nfe_data').delete().eq('id', id);
        error = deleteError;
      } else {
        const { error: deleteError } = await supabase.from('nfse_data').delete().eq('id', id);
        error = deleteError;
      }

      if (error) throw error;

      await fetchNotas();
      toast({ title: "Nota Removida", description: "A nota fiscal foi removida com sucesso." });
      return true;

    } catch (error: any) {
      console.error('Erro ao remover nota:', error);
      toast({ title: "Erro ao Remover", description: error.message, variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      fetchNotas();
    });

    fetchNotas();

    const nfeChannel = supabase.channel('realtime_nfe_data').on('postgres_changes', { event: '*', schema: 'public', table: 'nfe_data' }, () => fetchNotas()).subscribe();
    const nfseChannel = supabase.channel('realtime_nfse_data').on('postgres_changes', { event: '*', schema: 'public', table: 'nfse_data' }, () => fetchNotas()).subscribe();

    return () => {
      supabase.removeChannel(nfeChannel);
      supabase.removeChannel(nfseChannel);
      authListener.subscription.unsubscribe();
    };
  }, [fetchNotas]);

  return {
    notaList,
    isLoading,
    saveNota,
    deleteNota,
    refreshNFEs: fetchNotas
  };
};