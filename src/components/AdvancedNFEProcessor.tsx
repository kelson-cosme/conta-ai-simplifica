import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Eye, Download, Search, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NFEData, NFEParser } from '@/lib/nfe-parser';
import { useNFEData } from '@/hooks/useNFEData';
import { supabase } from '@/integrations/supabase/client';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

const AdvancedNFEProcessor = () => {
  const { nfeList, isLoading, saveNFE, deleteNFE, refreshNFEs } = useNFEData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFE, setSelectedNFE] = useState<NFEData | null>(null);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Autenticação Necessária", description: "Você precisa estar logado.", variant: "destructive" });
        return;
      }
      if (!geminiApiKey) throw new Error("Chave da API do Gemini não configurada.");

      let nfeData: NFEData;
      
      if (file.name.toLowerCase().endsWith('.xml')) {
        const content = await file.text();
        nfeData = await NFEParser.parseXML(content, geminiApiKey);
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        nfeData = await NFEParser.processPDF(file, geminiApiKey);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      const validation = NFEParser.validateNFE(nfeData);
      nfeData.status = validation.valid ? 'validada' : 'erro';
      
      await saveNFE(nfeData);

    } catch (error) {
      toast({ title: "Erro no Processamento", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await Promise.all(Array.from(files).map(processFile));
      refreshNFEs();
    }
  };

  const getStatusBadge = (status: NFEData['status']) => {
    const statusConfig = {
      processando: { variant: 'secondary' as const, label: 'Processando' },
      validada: { variant: 'default' as const, label: 'Validada' },
      cancelada: { variant: 'destructive' as const, label: 'Cancelada' },
      erro: { variant: 'destructive' as const, label: 'Erro' }
    };
    const config = statusConfig[status] || { variant: 'outline', label: 'Desconhecido' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredNFEs = nfeList.filter(nfe =>
    nfe.numero.includes(searchTerm) ||
    nfe.emitente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nfe.chaveAcesso.includes(searchTerm)
  );
  
  const totalNFEs = nfeList.length;
  const totalValue = nfeList.reduce((sum, nfe) => sum + (nfe.totais?.valorNota || 0), 0);
  const validatedNFEs = nfeList.filter(nfe => nfe.status === 'validada').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText />Processamento Avançado de NF-e</CardTitle>
          <CardDescription>Upload de arquivos XML ou PDF para extração via IA</CardDescription>
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total de NF-e</p>
                <p className="text-2xl font-bold">{totalNFEs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Validadas</p>
                <p className="text-2xl font-bold">{validatedNFEs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">R$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{NFEParser.formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isLoading && nfeList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>NF-e Processadas</CardTitle>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por número, emitente ou chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Emitente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNFEs.map((nfe) => (
                  <TableRow key={nfe.id}>
                    <TableCell className="font-medium">{nfe.numero}</TableCell>
                    <TableCell>{nfe.emitente.razaoSocial}</TableCell>
                    <TableCell>{new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={nfe.tipo === 'entrada' ? 'secondary' : 'outline'}>
                        {nfe.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell>{NFEParser.formatCurrency(nfe.totais.valorNota)}</TableCell>
                    <TableCell>{getStatusBadge(nfe.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className='h-8 w-8'
                              onClick={() => setSelectedNFE(nfe)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes da NF-e {nfe.numero}</DialogTitle>
                              <DialogDescription>
                                Informações completas da nota fiscal
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedNFE && (
                              <Tabs defaultValue="geral" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="geral">Geral</TabsTrigger>
                                  <TabsTrigger value="produtos">Produtos</TabsTrigger>
                                  <TabsTrigger value="impostos">Impostos</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="geral" className="space-y-4 pt-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-2 border-b pb-1">Emitente</h4>
                                      <p><strong>Razão Social:</strong> {selectedNFE.emitente.razaoSocial}</p>
                                      <p><strong>CNPJ:</strong> {NFEParser.formatCNPJ(selectedNFE.emitente.cnpj)}</p>
                                      <p><strong>Endereço:</strong> {selectedNFE.emitente.endereco}, {selectedNFE.emitente.municipio}-{selectedNFE.emitente.uf}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2 border-b pb-1">Destinatário</h4>
                                      <p><strong>Razão Social:</strong> {selectedNFE.destinatario.razaoSocial}</p>
                                      <p><strong>CNPJ/CPF:</strong> {selectedNFE.destinatario.cnpj ? NFEParser.formatCNPJ(selectedNFE.destinatario.cnpj) : selectedNFE.destinatario.cpf}</p>
                                      <p><strong>Endereço:</strong> {selectedNFE.destinatario.endereco}, {selectedNFE.destinatario.municipio}-{selectedNFE.destinatario.uf}</p>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="produtos">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Qtd</TableHead>
                                        <TableHead>Valor Unit.</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedNFE.produtos.map((produto, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{produto.descricao}</TableCell>
                                          <TableCell>{produto.quantidade} {produto.unidade}</TableCell>
                                          <TableCell>{NFEParser.formatCurrency(produto.valorUnitario)}</TableCell>
                                          <TableCell>{NFEParser.formatCurrency(produto.valorTotal)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TabsContent>
                                
                                <TabsContent value="impostos" className="pt-4">
                                  <h4 className="font-semibold mb-2">Totais e Impostos</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="p-3 bg-slate-100 rounded-md"><p className="text-xs text-slate-600">Valor dos Produtos</p><p className="font-bold">{NFEParser.formatCurrency(selectedNFE.totais.valorProdutos)}</p></div>
                                      <div className="p-3 bg-slate-100 rounded-md"><p className="text-xs text-slate-600">Desconto</p><p className="font-bold">{NFEParser.formatCurrency(selectedNFE.totais.valorDesconto)}</p></div>
                                      <div className="p-3 bg-slate-100 rounded-md"><p className="text-xs text-slate-600">ICMS</p><p className="font-bold">{NFEParser.formatCurrency(selectedNFE.totais.valorIcms)}</p></div>
                                      <div className="p-3 bg-slate-100 rounded-md"><p className="text-xs text-slate-600">IPI</p><p className="font-bold">{NFEParser.formatCurrency(selectedNFE.totais.valorIpi)}</p></div>
                                      <div className="p-3 bg-blue-100 rounded-md col-span-2 md:col-span-4"><p className="text-sm text-blue-800">Valor Total da Nota</p><p className="text-xl font-bold text-blue-800">{NFEParser.formatCurrency(selectedNFE.totais.valorNota)}</p></div>
                                  </div>
                                </TabsContent>
                                
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="icon" className='h-8 w-8'>
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                          onClick={() => deleteNFE(nfe.id)}
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

    </div>
  );
};

export default AdvancedNFEProcessor;