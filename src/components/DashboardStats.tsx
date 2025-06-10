import { TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardStats = () => {
  // Dados fictícios para demonstração
  const stats = [
    {
      title: "Notas Fiscais",
      value: "12",
      description: "Este mês",
      icon: FileText,
      trend: "+2 em relação ao mês anterior"
    },
    {
      title: "Receita Total",
      value: "R$ 8.547,20",
      description: "Março 2024",
      icon: TrendingUp,
      trend: "+12.5% em relação ao mês anterior"
    },
    {
      title: "Despesas",
      value: "R$ 3.241,50",
      description: "Março 2024", 
      icon: TrendingDown,
      trend: "-5.2% em relação ao mês anterior"
    },
    {
      title: "Impostos Devidos",
      value: "R$ 1.287,44",
      description: "Estimativa para abril",
      icon: DollarSign,
      trend: "Baseado nas notas processadas"
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
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;