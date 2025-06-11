import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Eye, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NFEData, NFEParser } from '@/lib/nfe-parser';

const AdvancedNFEProcessor = () => {
  const [processedNFEs, setProcessedNFEs] = useState<NFEData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFE, setSelectedNFE] = useState<NFEData | null>(null);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);

    try {
      let nfeData: NFEData;

      if (file.name.toLowerCase().endsWith('.xml')) {
        const content = await file.text();
        nfeData = NFEParser.parseXML(content);
        
        toast({
          title: "XML Processado",
          description: `NF-e ${nfeData.numero} processada com sucesso`,
        });
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        nfeData = await NFEParser.processPDF(file);
        
        toast({
          title: "PDF Processado",
          description: `NF-e ${nfeData.numero} extraída do PDF via OCR`,
        });
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      // Validar NF-e
      const validation = NFEParser.validateNFE(nfeData);
      if (!validation.valid) {
        nfeData.status = 'erro';
        toast({
          title: "Problemas na Validação",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
      }

      setProcessedNFEs(prev => [nfeData, ...prev]);

    } catch (error) {
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
  };

  const getStatusBadge = (status: NFEData['status']) => {
    const statusConfig = {
      processando: { variant: 'secondary' as const, label: 'Processando' },
      validada: { variant: 'default' as const, label: 'Validada' },
      cancelada: { variant: 'destructive' as const, label: 'Cancelada' },
      erro: { variant: 'destructive' as const, label: 'Erro' }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredNFEs = processedNFEs.filter(nfe =>
    nfe.numero.includes(searchTerm) ||
    nfe.emitente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nfe.chaveAcesso.includes(searchTerm)
  );

  const totalNFEs = processedNFEs.length;
  const totalValue = processedNFEs.reduce((sum, nfe) => sum + nfe.totais.valorNota, 0);
  const validatedNFEs = processedNFEs.filter(nfe => nfe.status === 'validada').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processamento Avançado de NF-e
          </CardTitle>
          <CardDescription>
            Upload de arquivos XML ou PDF para extração automática de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Selecione seus arquivos de NF-e</h3>
            <p className="text-muted-foreground mb-4">
              Processamento automático com extração de dados e validação
            </p>
            
            <input
              type="file"
              multiple
              accept=".xml,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="nfe-upload"
              disabled={isProcessing}
            />
            
            <Button asChild disabled={isProcessing}>
              <label htmlFor="nfe-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Selecionar Arquivos'}
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
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

      {/* Lista de NF-e Processadas */}
      {processedNFEs.length > 0 && (
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
                              size="sm"
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
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="geral">Geral</TabsTrigger>
                                  <TabsTrigger value="produtos">Produtos</TabsTrigger>
                                  <TabsTrigger value="impostos">Impostos</TabsTrigger>
                                  <TabsTrigger value="validacao">Validação</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="geral" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Emitente</h4>
                                      <p>{selectedNFE.emitente.razaoSocial}</p>
                                      <p>{NFEParser.formatCNPJ(selectedNFE.emitente.cnpj)}</p>
                                      <p>{selectedNFE.emitente.endereco}</p>
                                      <p>{selectedNFE.emitente.municipio}/{selectedNFE.emitente.uf}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Destinatário</h4>
                                      <p>{selectedNFE.destinatario.razaoSocial}</p>
                                      <p>{selectedNFE.destinatario.cnpj && NFEParser.formatCNPJ(selectedNFE.destinatario.cnpj)}</p>
                                      <p>{selectedNFE.destinatario.endereco}</p>
                                      <p>{selectedNFE.destinatario.municipio}/{selectedNFE.destinatario.uf}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Informações da Nota</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                      <p><strong>Chave:</strong> {selectedNFE.chaveAcesso}</p>
                                      <p><strong>Protocolo:</strong> {selectedNFE.protocolo}</p>
                                      <p><strong>Data:</strong> {new Date(selectedNFE.dataEmissao).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="produtos">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Qtd</TableHead>
                                        <TableHead>Valor Unit.</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedNFE.produtos.map((produto, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{produto.codigo}</TableCell>
                                          <TableCell>{produto.descricao}</TableCell>
                                          <TableCell>{produto.quantidade} {produto.unidade}</TableCell>
                                          <TableCell>{NFEParser.formatCurrency(produto.valorUnitario)}</TableCell>
                                          <TableCell>{NFEParser.formatCurrency(produto.valorTotal)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TabsContent>
                                
                                <TabsContent value="impostos">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Resumo de Impostos</h4>
                                      <div className="space-y-2">
                                        <p>ICMS: {NFEParser.formatCurrency(selectedNFE.totais.valorIcms)}</p>
                                        <p>IPI: {NFEParser.formatCurrency(selectedNFE.totais.valorIpi)}</p>
                                        <p>PIS: {NFEParser.formatCurrency(selectedNFE.totais.valorPis)}</p>
                                        <p>COFINS: {NFEParser.formatCurrency(selectedNFE.totais.valorCofins)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Totais</h4>
                                      <div className="space-y-2">
                                        <p>Produtos: {NFEParser.formatCurrency(selectedNFE.totais.valorProdutos)}</p>
                                        <p>Frete: {NFEParser.formatCurrency(selectedNFE.totais.valorFrete)}</p>
                                        <p>Desconto: {NFEParser.formatCurrency(selectedNFE.totais.valorDesconto)}</p>
                                        <p className="font-bold">Total: {NFEParser.formatCurrency(selectedNFE.totais.valorNota)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="validacao">
                                  <div className="space-y-4">
                                    {(() => {
                                      const validation = NFEParser.validateNFE(selectedNFE);
                                      return (
                                        <div>
                                          <div className="flex items-center gap-2 mb-4">
                                            {validation.valid ? (
                                              <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                              <AlertTriangle className="h-5 w-5 text-destructive" />
                                            )}
                                            <span className="font-semibold">
                                              {validation.valid ? 'NF-e Válida' : 'Problemas Encontrados'}
                                            </span>
                                          </div>
                                          
                                          {!validation.valid && (
                                            <div className="space-y-2">
                                              <h4 className="font-semibold text-destructive">Erros:</h4>
                                              {validation.errors.map((error, index) => (
                                                <p key={index} className="text-sm text-destructive">• {error}</p>
                                              ))}
                                            </div>
                                          )}
                                          
                                          {selectedNFE.observacoes && (
                                            <div>
                                              <h4 className="font-semibold mb-2">Observações:</h4>
                                              <p className="text-sm">{selectedNFE.observacoes}</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
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

      {processedNFEs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma NF-e processada</h3>
            <p className="text-muted-foreground">
              Faça upload de arquivos XML ou PDF para começar o processamento automático
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedNFEProcessor;