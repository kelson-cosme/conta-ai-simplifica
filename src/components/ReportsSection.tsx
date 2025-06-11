// src/components/ReportsSection.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNFEData } from "@/hooks/useNFEData";
import jsPDF from "jspdf";
// MODIFICADO: Importamos a função 'autoTable' diretamente em vez de importar para efeitos secundários.
import autoTable from "jspdf-autotable";

// REMOVIDO: O bloco "declare module" não é mais necessário,
// pois não estamos mais modificando a interface do jsPDF.

export const ReportsSection = () => {
  const { toast } = useToast();
  const { nfeList, isLoading } = useNFEData();

  const generateReport = (type: string) => {
    if (nfeList.length === 0) {
      toast({
        title: "Nenhum dado para gerar relatório",
        description: "Processe algumas notas fiscais primeiro.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Relatório de ${type}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 29);

    const tableColumn = ["Data", "Número", "Emitente", "Tipo", "Valor Total"];
    const tableRows: any[] = [];

    nfeList.forEach(nfe => {
      const nfeData = [
        new Date(nfe.dataEmissao).toLocaleDateString('pt-BR'),
        nfe.numero,
        nfe.emitente.razaoSocial,
        nfe.tipo,
        `R$ ${nfe.totais.valorNota.toFixed(2)}`
      ];
      tableRows.push(nfeData);
    });

    // MODIFICADO: A função agora é chamada como autoTable(doc, options)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    doc.save(`relatorio_${type.toLowerCase()}_${new Date().getTime()}.pdf`);

    toast({
      title: "Relatório Gerado",
      description: `O download do seu relatório de ${type} deve começar em breve.`,
    });
  };

  const reports = [
    {
      title: "Notas Fiscais",
      description: "Lista de todas as NF-e processadas",
      icon: FileText,
      type: "Notas"
    },
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
                disabled={isLoading || nfeList.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};