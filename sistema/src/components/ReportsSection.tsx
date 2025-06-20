import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNFEData } from "@/hooks/useNFEData";
import { NotaFiscalParser } from "@/lib/nfe-parser"; // ADICIONADO
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ReportsSection = () => {
  const { toast } = useToast();
  const { notaList, isLoading } = useNFEData(); // MODIFICADO

  const generateReport = (type: string) => {
    if (notaList.length === 0) { // MODIFICADO
      toast({
        title: "Nenhum dado para gerar relatório",
        description: "Processe alguns documentos fiscais primeiro.",
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

    // MODIFICADO: Colunas ajustadas para o novo formato
    const tableColumn = ["Data", "Número", "Emitente/Prestador", "Tipo Doc.", "Valor Total"];
    const tableRows: any[] = [];

    // MODIFICADO: Itera sobre a lista unificada 'notaList'
    notaList.forEach(nota => {
      const notaData = [
        new Date(nota.dataEmissao).toLocaleDateString('pt-BR'),
        nota.numero,
        nota.nomeEntidade, // Usa o campo unificado
        nota.docType.toUpperCase(), // Adiciona o tipo de documento
        NotaFiscalParser.formatCurrency(nota.valor) // Usa o campo unificado e formata
      ];
      tableRows.push(notaData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    doc.save(`relatorio_${type.toLowerCase().replace(' ', '_')}_${new Date().getTime()}.pdf`);

    toast({
      title: "Relatório Gerado",
      description: `O download do seu relatório de ${type} deve começar em breve.`,
    });
  };

  const reports = [
    {
      title: "Documentos Fiscais",
      description: "Lista de todas as NF-e e NFS-e processadas", // MODIFICADO
      icon: FileText,
      type: "Documentos"
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
                disabled={isLoading || notaList.length === 0} // MODIFICADO
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