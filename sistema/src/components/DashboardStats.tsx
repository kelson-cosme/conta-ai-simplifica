// src/components/DashboardStats.tsx
import { TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NotaFiscalParser } from '@/lib/nfe-parser'; // MODIFICADO: De NFEParser para NotaFiscalParser

interface DashboardStatsProps {
  isLoading: boolean;
  totalNotas: number;
  receitaTotal: number;
  despesasTotais: number;
  impostosTotais: number;
}

const DashboardStats = ({ 
  isLoading, 
  totalNotas = 0, 
  receitaTotal = 0, 
  despesasTotais = 0, 
  impostosTotais = 0 
}: DashboardStatsProps) => {

  if (isLoading) {
    // ... (código do skeleton sem alterações)
  }

  const stats = [
    {
      title: "Notas Fiscais",
      value: totalNotas.toString(),
      description: "Total processado",
      icon: FileText
    },
    {
      title: "Receita Total (Saídas)",
      value: NotaFiscalParser.formatCurrency(receitaTotal), // MODIFICADO
      description: "Valor total das notas de saída",
      icon: TrendingUp
    },
    {
      title: "Despesas (Entradas)",
      value: NotaFiscalParser.formatCurrency(despesasTotais), // MODIFICADO
      description: "Valor total das notas de entrada", 
      icon: TrendingDown
    },
    {
      title: "Impostos Devidos",
      value: NotaFiscalParser.formatCurrency(impostosTotais), // MODIFICADO
      description: "Soma dos impostos das notas",
      icon: DollarSign
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;