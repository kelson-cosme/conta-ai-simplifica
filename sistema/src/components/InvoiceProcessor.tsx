import { useState } from 'react';
import { FileText, TrendingUp, AlertCircle, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedNFEProcessor from './AdvancedNFEProcessor';

export const InvoiceProcessor = () => {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Dados mockados para demonstração
  const summaryData = [
    { label: 'NF-e Entrada', value: 127, amount: 'R$ 2.450.890,00', trend: '+12%', color: 'blue' },
    { label: 'NF-e Saída', value: 89, amount: 'R$ 1.890.340,00', trend: '+8%', color: 'green' },
    { label: 'Pendentes', value: 5, amount: 'R$ 45.230,00', trend: '-2%', color: 'yellow' },
    { label: 'Com Erro', value: 3, amount: 'R$ 12.500,00', trend: '0%', color: 'red' }
  ];

  const recentActivity = [
    { type: 'entrada', number: '000123', company: 'Fornecedor ABC Ltda', value: 'R$ 15.890,00', status: 'processada', time: '2 min atrás' },
    { type: 'saida', number: '000124', company: 'Cliente XYZ S/A', value: 'R$ 8.450,00', status: 'validada', time: '5 min atrás' },
    { type: 'entrada', number: '000125', company: 'Distribuidora DEF', value: 'R$ 23.120,00', status: 'erro', time: '10 min atrás' },
    { type: 'saida', number: '000126', company: 'Empresa GHI Ltda', value: 'R$ 5.680,00', status: 'pendente', time: '15 min atrás' },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processada: { variant: 'default' as const, label: 'Processada' },
      validada: { variant: 'secondary' as const, label: 'Validada' },
      pendente: { variant: 'outline' as const, label: 'Pendente' },
      erro: { variant: 'destructive' as const, label: 'Erro' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'entrada' ? 'secondary' : 'outline'}>
        {type === 'entrada' ? 'Entrada' : 'Saída'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Processamento de Notas Fiscais</h2>
          <p className="text-muted-foreground">
            Gestão completa das suas NF-e com processamento automático
          </p>
        </div>
      </div>

      <Tabs defaultValue="processor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="processor">Processar NF-e</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="processor">
          <AdvancedNFEProcessor />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryData.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{item.value}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.trend}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.amount}</p>
                    </div>
                    <div className={`p-2 rounded-full bg-${item.color}-100`}>
                      <FileText className={`h-4 w-4 text-${item.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendências Mensais
              </CardTitle>
              <CardDescription>
                Volume e valor das notas fiscais processadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Gráfico de tendências será exibido aqui</p>
                  <p className="text-sm text-muted-foreground">Integração com biblioteca de gráficos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas notas fiscais processadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        {getTypeBadge(activity.type)}
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                      </div>
                      <div>
                        <p className="font-medium">NF-e {activity.number}</p>
                        <p className="text-sm text-muted-foreground">{activity.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{activity.value}</p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alertas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">5 NF-e pendentes de validação</p>
                    <p className="text-sm text-yellow-700">Requer atenção manual para prosseguir</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">3 NF-e com erros de processamento</p>
                    <p className="text-sm text-red-700">Verificar dados e reprocessar se necessário</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};