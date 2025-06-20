import { useMemo } from 'react';
import DashboardStats from '@/components/DashboardStats';
import UploadArea from '@/components/UploadArea';
import AIHelper from '@/components/AIHelper';
import { ReportsSection } from "@/components/ReportsSection";
import AdvancedNFEProcessor from "@/components/AdvancedNFEProcessor";
import AuthWrapper from "@/components/AuthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNFEData } from "@/hooks/useNFEData";

const Index = () => {
  const { notaList, isLoading } = useNFEData();

  // MODIFICADO: Lógica de cálculo do dashboard foi atualizada
  const dashboardData = useMemo(() => {
    // Separa as notas por tipo para facilitar os cálculos
    const nfeList = notaList.filter(nota => nota.docType === 'nfe');
    const nfseList = notaList.filter(nota => nota.docType === 'nfse');

    // Calcula a receita de produtos (NF-e de saída)
    const receitaDeProdutos = nfeList
      .filter(nfe => nfe.tipo === 'saida')
      .reduce((sum, nfe) => sum + nfe.valor, 0);
      
    // Calcula a receita de serviços (todas as NFS-e)
    const receitaDeServicos = nfseList.reduce((sum, nfse) => sum + nfse.valor, 0);

    // Soma as duas receitas para o total
    const receitaTotal = receitaDeProdutos + receitaDeServicos;

    // Despesas continuam sendo apenas as NF-e de entrada
    const despesasTotais = nfeList
      .filter(nfe => nfe.tipo === 'entrada')
      .reduce((sum, nfe) => sum + nfe.valor, 0);

    const impostosTotais = 0; // Temporariamente desativado

    return {
      totalNotas: notaList.length,
      receitaTotal,
      despesasTotais,
      impostosTotais
    };
  }, [notaList]);

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Simplifica
          </h2>
          <p className="text-muted-foreground">
            Sua gestão fiscal e contábil em um só lugar.
          </p>
        </div>

        <DashboardStats 
          isLoading={isLoading}
          totalNotas={dashboardData.totalNotas}
          receitaTotal={dashboardData.receitaTotal}
          despesasTotais={dashboardData.despesasTotais}
          impostosTotais={dashboardData.impostosTotais}
        />
        
        <div className="mt-8">
          <Tabs defaultValue="inicio" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inicio">Início</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
              <TabsTrigger value="chat">Assistente IA</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inicio" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UploadArea />
                <AIHelper />
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Bem-vindo à Simplifica!</h3>
                <p className="text-muted-foreground mb-4">
                  Comece fazendo upload das suas notas fiscais para ter uma visão completa 
                  da sua situação contábil. Nossa IA está aqui para ajudar com qualquer dúvida.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                    📄 Leitura de NF-e e NFS-e
                  </span>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                    📊 Relatórios automatizados
                  </span>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                    🤖 Assistente IA especializado
                  </span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documentos">
              <AdvancedNFEProcessor />
            </TabsContent>
            
            <TabsContent value="relatorios">
              <ReportsSection />
            </TabsContent>
            
            <TabsContent value="chat">
              <div className="max-w-4xl mx-auto">
                <AIHelper />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Index;