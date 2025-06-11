import DashboardStats from '@/components/DashboardStats';
import UploadArea from '@/components/UploadArea';
import AIHelper from '@/components/AIHelper';
import { ReportsSection } from "@/components/ReportsSection";
import AdvancedNFEProcessor from "@/components/AdvancedNFEProcessor";
import AuthWrapper from "@/components/AuthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Dashboard ContábilFácil
          </h2>
          <p className="text-muted-foreground">
            Gestão contábil completa para micro e pequenos empreendedores
          </p>
        </div>

        {/* Dashboard Stats sempre visível */}
        <DashboardStats />
        
        {/* Main Content Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload">Início</TabsTrigger>
              <TabsTrigger value="invoices">Notas Fiscais</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
              <TabsTrigger value="chat">Assistente IA</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UploadArea />
                <AIHelper />
              </div>
              
              {/* Seção de boas-vindas */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Bem-vindo ao ContábilFácil!</h3>
                <p className="text-muted-foreground mb-4">
                  Comece fazendo upload das suas notas fiscais para ter uma visão completa 
                  da sua situação contábil. Nossa IA está aqui para ajudar com qualquer dúvida.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                    📄 Leitura automática de NF-e
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
            
            <TabsContent value="invoices">
              <AdvancedNFEProcessor />
            </TabsContent>
            
            <TabsContent value="reports">
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
