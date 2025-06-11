-- Tabela principal para armazenar dados das NF-e
CREATE TABLE public.nfe_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  numero TEXT NOT NULL,
  serie TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  chave_acesso TEXT NOT NULL UNIQUE,
  protocolo TEXT,
  status TEXT NOT NULL CHECK (status IN ('processando', 'validada', 'cancelada', 'erro')),
  
  -- Dados do emitente (JSONB para flexibilidade)
  emitente JSONB NOT NULL,
  
  -- Dados do destinatário (JSONB para flexibilidade)
  destinatario JSONB NOT NULL,
  
  -- Produtos (array de JSONB)
  produtos JSONB NOT NULL,
  
  -- Totais (JSONB)
  totais JSONB NOT NULL,
  
  -- Dados da transportadora (opcional)
  transportadora JSONB,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nfe_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para nfe_data
CREATE POLICY "Users can view their own NFe data" 
ON public.nfe_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NFe data" 
ON public.nfe_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFe data" 
ON public.nfe_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFe data" 
ON public.nfe_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_nfe_data_updated_at
  BEFORE UPDATE ON public.nfe_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_nfe_data_user_id ON public.nfe_data(user_id);
CREATE INDEX idx_nfe_data_numero ON public.nfe_data(numero);
CREATE INDEX idx_nfe_data_chave_acesso ON public.nfe_data(chave_acesso);
CREATE INDEX idx_nfe_data_data_emissao ON public.nfe_data(data_emissao);
CREATE INDEX idx_nfe_data_status ON public.nfe_data(status);