import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import UploadArea from '@/components/UploadArea';
import AIHelper from '@/components/AIHelper';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Visão geral da sua situação contábil e fiscal
          </p>
        </div>

        <div className="space-y-8">
          {/* Estatísticas principais */}
          <DashboardStats />
          
          {/* Grid principal com upload e assistente IA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <UploadArea />
            <AIHelper />
          </div>
          
          {/* Seção de boas-vindas para novos usuários */}
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
                📊 Relatórios simplificados
              </span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                🤖 Assistente IA especializado
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
