import { useState } from 'react';
import { Upload, FileText, CheckCircle, Eye, Trash2, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { NotaFiscalParser, type NFEData, type NFSEData } from '@/lib/nfe-parser';
import { useNFEData, type UnifiedNota } from '@/hooks/useNFEData';
import { supabase } from '@/integrations/supabase/client';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const AdvancedNFEProcessor = () => {
  const { notaList, isLoading, saveNota, deleteNota } = useNFEData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailedNota, setDetailedNota] = useState<NFEData | NFSEData | null>(null);
  const [detailedNotaType, setDetailedNotaType] = useState<'nfe' | 'nfse' | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const { toast } = useToast();

  const processAndSaveFile = async (file: File) => {
    setIsProcessing(true);
    try {
      if (!geminiApiKey) throw new Error("Chave da API não configurada.");
      
      const parsedNota = await NotaFiscalParser.processDocument(file, geminiApiKey);
      
      if (parsedNota.docType === 'unknown') throw new Error(parsedNota.error);
      
      await saveNota(parsedNota);

    } catch (error) {
      toast({ title: "Erro no Processamento", description: error instanceof Error ? error.message : "Erro desconhecido.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) await Promise.all(Array.from(files).map(processAndSaveFile));
  };

  // MODIFICADO: A função agora mapeia os dados do banco para o formato do frontend
  const handleViewDetails = async (nota: UnifiedNota) => {
    setIsFetchingDetails(true);
    setDetailedNota(null);
    setDetailedNotaType(nota.docType);
    setIsDialogOpen(true);

    try {
      const tableName = nota.docType === 'nfe' ? 'nfe_data' : 'nfse_data';
      const { data, error } = await supabase.from(tableName).select('*').eq('id', nota.id).single();

      if (error) throw error;
      if (!data) throw new Error("Nota não encontrada.");

      // ADICIONADO: Mapeamento dos dados do banco (snake_case) para o formato da nossa interface (camelCase)
      if (nota.docType === 'nfe') {
        const dbRow = data as any;
        const mappedData: NFEData = {
          id: dbRow.id,
          numero: dbRow.numero,
          serie: dbRow.serie,
          dataEmissao: dbRow.data_emissao,
          tipo: dbRow.tipo,
          chaveAcesso: dbRow.chave_acesso,
          protocolo: dbRow.protocolo,
          status: dbRow.status,
          emitente: dbRow.emitente,
          destinatario: dbRow.destinatario,
          produtos: dbRow.produtos,
          totais: dbRow.totais,
          transportadora: dbRow.transportadora,
          observacoes: dbRow.observacoes
        };
        setDetailedNota(mappedData);
      } else {
        const dbRow = data as any;
        const mappedData: NFSEData = {
          id: dbRow.id,
          numero: dbRow.numero,
          codigoVerificacao: dbRow.codigo_verificacao,
          dataEmissao: dbRow.data_emissao,
          status: dbRow.status,
          prestador: dbRow.prestador,
          tomador: dbRow.tomador,
          servicos: dbRow.servicos,
          totais: dbRow.totais,
          observacoes: dbRow.observacoes
        };
        setDetailedNota(mappedData);
      }

    } catch (error: any) {
      toast({ title: "Erro ao buscar detalhes", description: error.message, variant: "destructive" });
      setIsDialogOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processando: { variant: 'secondary' as const, label: 'Processando' },
      validada: { variant: 'default' as const, label: 'Validada' },
      cancelada: { variant: 'destructive' as const, label: 'Cancelada' },
      erro: { variant: 'destructive' as const, label: 'Erro' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', label: 'Desconhecido' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }; 

  const filteredNotas = notaList.filter(nota =>
    nota.numero.includes(searchTerm) ||
    nota.nomeEntidade.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  const totalNotas = notaList.length;
  const totalValue = notaList.reduce((sum, nota) => sum + nota.valor, 0);
  const validatedNFEs = notaList.filter(nota => nota.status === 'validada').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText />Processamento de Notas Fiscais</CardTitle>
          <CardDescription>Faça o upload de arquivos XML (NF-e) ou PDF (NF-e / NFS-e)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input type="file" multiple accept=".xml,.pdf" onChange={handleFileSelect} className="hidden" id="nfe-upload-advanced" disabled={isProcessing}/>
            <Button asChild disabled={isProcessing}>
              <label htmlFor="nfe-upload-advanced" className="cursor-pointer">
                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : <><Upload className="h-4 w-4 mr-2" />Selecionar Arquivos</>}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ... Cards de Estatísticas ... */}
      </div>

      {!isLoading && notaList.length > 0 && (
        <Card>
          <CardContent className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Emitente/Prestador</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotas.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell><Badge variant={nota.docType === 'nfe' ? 'default' : 'secondary'}>{nota.docType.toUpperCase()}</Badge></TableCell>
                    <TableCell className="font-medium">{nota.numero}</TableCell>
                    <TableCell>{nota.nomeEntidade}</TableCell>
                    <TableCell>{new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{NotaFiscalParser.formatCurrency(nota.valor)}</TableCell>
                    <TableCell>{getStatusBadge(nota.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => handleViewDetails(nota)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                          onClick={() => deleteNota(nota.id, nota.docType)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes do Documento Fiscal</DialogTitle>
            <DialogDescription>
              Informações completas extraídas do documento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4">
            {isFetchingDetails && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            
            {detailedNota && detailedNotaType === 'nfe' && (
              <Tabs defaultValue="produtos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="geral">Geral</TabsTrigger>
                  <TabsTrigger value="produtos">Produtos</TabsTrigger>
                </TabsList>
                <TabsContent value="geral" className="pt-4 space-y-4">
                  <p><strong>Chave de Acesso:</strong> {(detailedNota as NFEData).chaveAcesso}</p>
                  <div>
                    <h4 className="font-semibold">Emitente</h4>
                    <p>{(detailedNota as NFEData).emitente.razaoSocial} - {NotaFiscalParser.formatCNPJ((detailedNota as NFEData).emitente.cnpj)}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold">Destinatário</h4>
                    <p>{(detailedNota as NFEData).destinatario.razaoSocial} - {NotaFiscalParser.formatCNPJ((detailedNota as NFEData).destinatario.cnpj || (detailedNota as NFEData).destinatario.cpf || '')}</p>
                  </div>
                </TabsContent>
                <TabsContent value="produtos">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Qtd.</TableHead>
                        <TableHead className="text-right">Vl. Unit.</TableHead>
                        <TableHead className="text-right">Vl. Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(detailedNota as NFEData).produtos.map((produto, index) => (
                        <TableRow key={index}>
                          <TableCell>{produto.descricao}</TableCell>
                          <TableCell className="text-right">{produto.quantidade} {produto.unidade}</TableCell>
                          <TableCell className="text-right">{NotaFiscalParser.formatCurrency(produto.valorUnitario)}</TableCell>
                          <TableCell className="text-right">{NotaFiscalParser.formatCurrency(produto.valorTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}

            {detailedNota && detailedNotaType === 'nfse' && (
              <Tabs defaultValue="servicos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="geral">Geral</TabsTrigger>
                  <TabsTrigger value="servicos">Serviços</TabsTrigger>
                </TabsList>
                <TabsContent value="geral" className="pt-4 space-y-4">
                   <p><strong>Código de Verificação:</strong> {(detailedNota as NFSEData).codigoVerificacao}</p>
                   <div>
                    <h4 className="font-semibold">Prestador do Serviço</h4>
                    <p>{(detailedNota as NFSEData).prestador.razaoSocial} - {NotaFiscalParser.formatCNPJ((detailedNota as NFSEData).prestador.cnpj)}</p>
                  </div>
                   <div>
                    <h4 className="font-semibold">Tomador do Serviço</h4>
                    <p>{(detailedNota as NFSEData).tomador.razaoSocial} - {NotaFiscalParser.formatCNPJ((detailedNota as NFSEData).tomador.cnpj || (detailedNota as NFSEData).tomador.cpf || '')}</p>
                  </div>
                </TabsContent>
                <TabsContent value="servicos">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição do Serviço</TableHead>
                        <TableHead className="text-right">Qtd.</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(detailedNota as NFSEData).servicos.map((servico, index) => (
                        <TableRow key={index}>
                          <TableCell>{servico.descricao}</TableCell>
                          <TableCell className="text-right">{servico.quantidade}</TableCell>
                          <TableCell className="text-right">{NotaFiscalParser.formatCurrency(servico.valorTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedNFEProcessor;