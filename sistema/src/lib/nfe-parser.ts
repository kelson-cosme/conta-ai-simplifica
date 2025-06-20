// --- INTERFACES DE DADOS ---
export interface NFEData {
  id: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  tipo: 'entrada' | 'saida';
  chaveAcesso: string;
  protocolo?: string;
  status: 'processando' | 'validada' | 'cancelada' | 'erro';
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    endereco: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  destinatario: {
    cnpj?: string;
    cpf?: string;
    razaoSocial: string;
    endereco: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  produtos: Array<{
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  totais: {
    baseIcms: number;
    valorIcms: number;
    valorProdutos: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    valorIpi: number;
    valorPis: number;
    valorCofins: number;
    valorNota: number;
  };
  transportadora?: {
    cnpj: string;
    razaoSocial: string;
    endereco: string;
  };
  observacoes?: string;
}

export interface NFSEData {
  id: string;
  numero: string;
  codigoVerificacao: string;
  dataEmissao: string;
  status: 'processando' | 'validada' | 'cancelada' | 'erro';
  prestador: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    endereco: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  tomador: {
    cnpj?: string;
    cpf?: string;
    razaoSocial: string;
    endereco: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  servicos: Array<{
    codigo: string;
    descricao: string;
    cst: string;
    aliq: number;
    valorUnitario: number;
    quantidade: number;
    valorTotal: number;
  }>;
  totais: {
    baseCalculo: number;
    valorIss: number;
    valorTotalServicos: number;
  };
  observacoes?: string;
}

export type ParsedNota = 
  | { docType: 'nfe'; data: NFEData }
  | { docType: 'nfse'; data: NFSEData }
  | { docType: 'unknown'; error: string };

// --- FUNÇÕES DE VALIDAÇÃO E LIMPEZA ---
function validateNFE(data: any): boolean {
  return data && data.chaveAcesso && data.emitente?.cnpj && data.numero && data.serie;
}

function validateNFSE(data: any): boolean {
  return data && data.codigoVerificacao && data.prestador?.cnpj && data.numero && data.totais?.valorTotalServicos > 0;
}

function sanitizeNFEData(data: any): NFEData {
  const getNumber = (value: any) => (typeof value === 'number' ? value : 0);

  data.numero = data.numero || "S/N";
  data.serie = data.serie || "0";
  data.chaveAcesso = data.chaveAcesso || "";

  data.totais = {
    baseIcms: getNumber(data.totais?.baseIcms), valorIcms: getNumber(data.totais?.valorIcms),
    valorProdutos: getNumber(data.totais?.valorProdutos), valorFrete: getNumber(data.totais?.valorFrete),
    valorSeguro: getNumber(data.totais?.valorSeguro), valorDesconto: getNumber(data.totais?.valorDesconto),
    valorIpi: getNumber(data.totais?.valorIpi), valorPis: getNumber(data.totais?.valorPis),
    valorCofins: getNumber(data.totais?.valorCofins), valorNota: getNumber(data.totais?.valorNota),
  };
  data.produtos = Array.isArray(data.produtos) ? data.produtos : [];
  data.status = validateNFE(data) ? 'validada' : 'erro';
  return data as NFEData;
}

function sanitizeNFSEData(data: any): NFSEData {
  const getNumber = (value: any) => (typeof value === 'number' ? value : 0);
  
  data.numero = data.numero || "S/N";
  data.codigoVerificacao = data.codigoVerificacao || "";

  data.totais = {
    baseCalculo: getNumber(data.totais?.baseCalculo),
    valorIss: getNumber(data.totais?.valorIss),
    valorTotalServicos: getNumber(data.totais?.valorTotalServicos),
  };
  data.servicos = Array.isArray(data.servicos) ? data.servicos : [];
  data.status = validateNFSE(data) ? 'validada' : 'erro';
  return data as NFSEData;
}

// --- LÓGICA DO PARSER ---
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}

const UNIVERSAL_PROMPT = `
  Sua tarefa é analisar um documento fiscal brasileiro e extrair suas informações.
  
  1.  **Primeiro, identifique o tipo de documento.** Ele é uma "NF-e" (Nota Fiscal Eletrônica, para produtos) ou uma "NFS-e" (Nota Fiscal de Serviço Eletrônica, para serviços)?
  
  2.  **Segundo, extraia os dados** de acordo com o schema JSON correspondente ao tipo de documento identificado.
      - Se um campo opcional não for encontrado, seu valor deve ser \`null\`.
      - Datas devem estar no formato YYYY-MM-DD.
      - Não invente dados.

  3.  **Terceiro, retorne um ÚNICO objeto JSON** com a seguinte estrutura:
      \`\`\`json
      {
        "docType": "nfe" | "nfse" | "unknown",
        "data": { ...dados extraídos... }
      }
      \`\`\`

  **Schema para docType: "nfe"**
  {
    "numero": "string", "serie": "string", "dataEmissao": "string", "chaveAcesso": "string | null", "protocolo": "string | null",
    "emitente": { "cnpj": "string", "razaoSocial": "string", "nomeFantasia": "string | null", "endereco": "string", "municipio": "string", "uf": "string", "cep": "string" },
    "destinatario": { "cnpj": "string | null", "cpf": "string | null", "razaoSocial": "string", "endereco": "string", "municipio": "string", "uf": "string", "cep": "string" },
    "produtos": [ { "codigo": "string", "descricao": "string", "ncm": "string", "cfop": "string", "unidade": "string", "quantidade": "number", "valorUnitario": "number", "valorTotal": "number" } ],
    "totais": { "baseIcms": "number | null", "valorIcms": "number | null", "valorProdutos": "number", "valorFrete": "number | null", "valorSeguro": "number | null", "valorDesconto": "number | null", "valorIpi": "number | null", "valorPis": "number | null", "valorCofins": "number | null", "valorNota": "number" },
    "observacoes": "string | null"
  }

  **Schema para docType: "nfse"**
  {
    "numero": "string", "codigoVerificacao": "string", "dataEmissao": "string",
    "prestador": { "cnpj": "string", "razaoSocial": "string", "nomeFantasia": "string | null", "endereco": "string", "municipio": "string", "uf": "string", "cep": "string" },
    "tomador": { "cnpj": "string | null", "cpf": "string | null", "razaoSocial": "string", "endereco": "string", "municipio": "string", "uf": "string", "cep": "string" },
    "servicos": [ { "codigo": "string | null", "descricao": "string", "cst": "string | null", "aliq": "number | null", "valorUnitario": "number", "quantidade": "number", "valorTotal": "number" } ],
    "totais": { "baseCalculo": "number | null", "valorIss": "number | null", "valorTotalServicos": "number" },
    "observacoes": "string | null"
  }
`;

export class NotaFiscalParser {
  static async processDocument(file: File, geminiApiKey: string): Promise<ParsedNota> {
    if (!geminiApiKey) throw new Error("A chave da API do Gemini não foi fornecida.");
    
    const isXml = file.type === 'application/xml' || file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml');
    let requestBody: any;

    if (isXml) {
      const xmlContent = await file.text();
      requestBody = { contents: [{ parts: [{ text: `${UNIVERSAL_PROMPT}\n\nConteúdo do Documento:\n${xmlContent}` }] }] };
    } else {
      const base64Data = await fileToBase64(file);
      requestBody = {
        contents: [{ parts: [ { text: UNIVERSAL_PROMPT }, { inline_data: { mime_type: file.type, data: base64Data } } ] }]
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`Erro na API do Gemini: ${response.statusText}`);

    const responseData = await response.json();
    const jsonText = responseData.candidates[0].content.parts[0].text;

    try {
      const result = JSON.parse(jsonText.replace(/```json\n?|\n?```/g, ''));
      
      if (result.docType === 'nfe') {
        const sanitizedData = sanitizeNFEData(result.data);
        return { docType: 'nfe', data: { ...sanitizedData, tipo: isXml ? 'saida' : 'entrada' } };
      }
      
      if (result.docType === 'nfse') {
        const sanitizedData = sanitizeNFSEData(result.data);
        return { docType: 'nfse', data: sanitizedData };
      }
      
      return { docType: 'unknown', error: "Tipo de documento não reconhecido pela IA." };
    } catch (e) {
      console.error("Erro ao analisar JSON da IA:", jsonText, e);
      throw new Error("A IA retornou uma resposta em formato JSON inválido.");
    }
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
  static formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const numbers = cnpj.replace(/[^\d]/g, '');
    if (numbers.length !== 14) return cnpj;
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}