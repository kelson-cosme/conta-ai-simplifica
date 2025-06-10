import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, TrendingUp, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ReportsSection = () => {
  const { toast } = useToast();

  const generateReport = (type: string) => {
    toast({
      title: "Relatório Gerado",
      description: `Relatório ${type} foi gerado com sucesso!`,
    });
  };

  const reports = [
    {
      title: "Relatório Mensal",
      description: "Receitas, despesas e impostos do mês",
      icon: FileText,
      type: "mensal"
    },
    {
      title: "Análise Tributária",
      description: "Análise do regime tributário ideal",
      icon: Calculator,
      type: "tributaria"
    },
    {
      title: "Fluxo de Caixa",
      description: "Movimentação financeira detalhada",
      icon: TrendingUp,
      type: "fluxo"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Relatórios Automatizados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.type} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <report.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {report.description}
              </p>
              <Button 
                onClick={() => generateReport(report.title)}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">R$ 12.450</p>
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">R$ 2.890</p>
              <p className="text-sm text-muted-foreground">Impostos Devidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">R$ 7.320</p>
              <p className="text-sm text-muted-foreground">Despesas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">R$ 2.240</p>
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};