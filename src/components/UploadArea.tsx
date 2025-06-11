import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNFEData } from '@/hooks/useNFEData';
import { NFEParser, NFEData } from '@/lib/nfe-parser';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

interface ProcessedFile {
  name: string;
  size: number;
  status: 'processando' | 'sucesso' | 'erro';
  id: string;
  message: string;
}

const UploadArea = () => {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { saveNFE } = useNFEData();

  const processFile = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    const newFile: ProcessedFile = {
      id: fileId, name: file.name, size: file.size, status: 'processando', message: 'Enviando para IA...'
    };
    setProcessedFiles(prev => [newFile, ...prev]);

    try {
      if (!geminiApiKey) throw new Error("Chave da API do Gemini não configurada.");

      let nfeData: NFEData;

      if (file.type === 'application/xml' || file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')) {
        const content = await file.text();
        nfeData = await NFEParser.parseXML(content, geminiApiKey);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        nfeData = await NFEParser.processPDF(file, geminiApiKey);
      } else {
        throw new Error('Tipo de arquivo não suportado.');
      }
      
      const validation = NFEParser.validateNFE(nfeData);
      nfeData.status = validation.valid ? 'validada' : 'erro';

      await saveNFE(nfeData);

      setProcessedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'sucesso', message: `NF-e ${nfeData.numero} salva!` } : f));
    } catch (error: any) {
      setProcessedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'erro', message: error.message } : f));
      toast({ title: "Erro no Processamento", description: error.message, variant: "destructive" });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    await Promise.all(Array.from(files).map(processFile));
    setIsProcessing(false);
  };
  
  const handleFileSelect = () => fileInputRef.current?.click();
  const removeFile = (id: string) => setProcessedFiles(prev => prev.filter(f => f.id !== id));
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Upload />Upload de Notas Fiscais</CardTitle>
        <CardDescription>Arraste ou selecione seus arquivos XML ou PDF de NF-e</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <input ref={fileInputRef} type="file" multiple accept=".xml,.pdf,application/xml,text/xml,application/pdf" onChange={handleFileChange} className="hidden" />
          <Button onClick={handleFileSelect} disabled={isProcessing}>
            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : 'Selecionar Arquivos'}
          </Button>
        </div>

        {processedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            {processedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {file.status === 'processando' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {file.status === 'sucesso' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {file.status === 'erro' && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className={`text-xs ${file.status === 'erro' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {formatFileSize(file.size)} • {file.message}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} className="flex-shrink-0 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadArea;