import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Calculator, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  number: string;
  emitter: string;
  cnpj: string;
  date: string;
  total: number;
  taxes: {
    icms: number;
    ipi: number;
    pis: number;
    cofins: number;
  };
  status: 'processed' | 'pending' | 'error';
}

export const InvoiceProcessor = () => {
  const { toast } = useToast();

  // Dados mock de notas processadas
  const invoices: Invoice[] = [
    {
      id: "1",
      number: "000001234",
      emitter: "Fornecedor ABC Ltda",
      cnpj: "12.345.678/0001-90",
      date: "2024-06-08",
      total: 2500.00,
      taxes: {
        icms: 300.00,
        ipi: 50.00,
        pis: 16.25,
        cofins: 75.00
      },
      status: 'processed'
    },
    {
      id: "2",
      number: "000001235",
      emitter: "Distribuidora XYZ S.A.",
      cnpj: "98.765.432/0001-10",
      date: "2024-06-07",
      total: 1800.00,
      taxes: {
        icms: 216.00,
        ipi: 0.00,
        pis: 11.70,
        cofins: 54.00
      },
      status: 'processed'
    },
    {
      id: "3",
      number: "000001236",
      emitter: "Empresa DEF Ltda",
      cnpj: "11.222.333/0001-44",
      date: "2024-06-09",
      total: 950.00,
      taxes: {
        icms: 114.00,
        ipi: 19.00,
        pis: 6.18,
        cofins: 28.50
      },
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      processed: "default" as const,
      pending: "secondary" as const,
      error: "destructive" as const
    };
    
    const labels = {
      processed: "Processada",
      pending: "Pendente",
      error: "Erro"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const viewDetails = (invoice: Invoice) => {
    toast({
      title: "Detalhes da Nota",
      description: `Nota ${invoice.number} - ${invoice.emitter}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Notas Fiscais Processadas</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {invoices.length} notas processadas
        </div>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-base">NF-e {invoice.number}</CardTitle>
                    <p className="text-sm text-muted-foreground">{invoice.emitter}</p>
                  </div>
                </div>
                {getStatusBadge(invoice.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">{invoice.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{new Date(invoice.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-medium text-lg">R$ {invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Impostos</p>
                  <p className="font-medium text-destructive">
                    R$ {Object.values(invoice.taxes).reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <Calculator className="h-3 w-3" />
                  <span>ICMS: R$ {invoice.taxes.icms.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calculator className="h-3 w-3" />
                  <span>IPI: R$ {invoice.taxes.ipi.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calculator className="h-3 w-3" />
                  <span>PIS: R$ {invoice.taxes.pis.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calculator className="h-3 w-3" />
                  <span>COFINS: R$ {invoice.taxes.cofins.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => viewDetails(invoice)}
                className="w-full md:w-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};