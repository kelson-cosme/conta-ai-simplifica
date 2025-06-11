import { TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NFEParser } from '@/lib/nfe-parser';

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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
      value: NFEParser.formatCurrency(receitaTotal),
      description: "Valor total das notas de saída",
      icon: TrendingUp
    },
    {
      title: "Despesas (Entradas)",
      value: NFEParser.formatCurrency(despesasTotais),
      description: "Valor total das notas de entrada", 
      icon: TrendingDown
    },
    {
      title: "Impostos Devidos",
      value: NFEParser.formatCurrency(impostosTotais),
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