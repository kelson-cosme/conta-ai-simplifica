-- Tabela para armazenar dados das NFS-e (Nota Fiscal de Serviço Eletrônica)
CREATE TABLE public.nfse_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Campos específicos da NFS-e
  numero TEXT NOT NULL,
  codigo_verificacao TEXT NOT NULL,
  data_emissao DATE NOT NULL,

  -- Campos em comum com NF-e (usando JSONB para flexibilidade)
  prestador JSONB NOT NULL, -- Equivalente ao "emitente"
  tomador JSONB NOT NULL,   -- Equivalente ao "destinatário"
  servicos JSONB NOT NULL,  -- Equivalente aos "produtos"
  totais JSONB NOT NULL,

  -- Campos de controle
  status TEXT NOT NULL CHECK (status IN ('processando', 'validada', 'cancelada', 'erro')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.nfse_data ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Users can view their own NFSe data" ON public.nfse_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own NFSe data" ON public.nfse_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own NFSe data" ON public.nfse_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own NFSe data" ON public.nfse_data FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_nfse_data_updated_at
  BEFORE UPDATE ON public.nfse_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); -- Reutilizando a função já existente

-- Índices para performance
CREATE INDEX idx_nfse_data_user_id ON public.nfse_data(user_id);
CREATE INDEX idx_nfse_data_numero ON public.nfse_data(numero);
CREATE INDEX idx_nfse_data_codigo_verificacao ON public.nfse_data(codigo_verificacao);