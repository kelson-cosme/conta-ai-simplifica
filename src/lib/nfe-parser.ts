// src/lib/nfe-parser.ts

export interface NFEData {
  id: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  tipo: 'entrada' | 'saida';
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
  // ADICIONADO: A propriedade transportadora foi adicionada de volta e é opcional.
  transportadora?: {
    cnpj: string;
    razaoSocial: string;
    endereco: string;
  };
  observacoes?: string;
  chaveAcesso: string;
  protocolo?: string;
  status: 'processando' | 'validada' | 'cancelada' | 'erro';
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
  });
}

// MODIFICADO: O esquema JSON no prompt agora inclui o campo "transportadora".
const JSON_SCHEMA_PROMPT = `
  O formato do JSON deve ser o seguinte:
  {
    "numero": "string", "serie": "string", "dataEmissao": "string no formato YYYY-MM-DD",
    "chaveAcesso": "string (a chave de 44 dígitos, se presente)", "protocolo": "string (se presente)",
    "emitente": { "cnpj": "string", "razaoSocial": "string", "endereco": "string", "municipio": "string", "uf": "string", "cep": "string" },
    "destinatario": { "cnpj": "string", "cpf": "string", "razaoSocial": "string", "endereco": "string", "municipio": "string", "uf": "string", "cep": "string" },
    "produtos": [ { "codigo": "string", "descricao": "string", "ncm": "string", "cfop": "string", "unidade": "string", "quantidade": "number", "valorUnitario": "number", "valorTotal": "number" } ],
    "totais": { "baseIcms": "number", "valorIcms": "number", "valorProdutos": "number", "valorFrete": "number", "valorSeguro": "number", "valorDesconto": "number", "valorIpi": "number", "valorPis": "number", "valorCofins": "number", "valorNota": "number" },
    "transportadora": { "cnpj": "string", "razaoSocial": "string", "endereco": "string (concatenar logradouro, município e UF)" },
    "observacoes": "string (informações complementares, se houver)"
  }
`;

export class NFEParser {
  static async parseXML(xmlContent: string, geminiApiKey: string): Promise<NFEData> {
    if (!geminiApiKey) throw new Error("A chave da API do Gemini não foi fornecida.");
    
    const prompt = `Você é um especialista em processar documentos fiscais brasileiros. Analise o conteúdo do XML de NF-e abaixo. Retorne APENAS um objeto JSON válido, sem nenhum texto extra. ${JSON_SCHEMA_PROMPT}\n\nConteúdo XML: ${xmlContent}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) throw new Error(`Erro na API do Gemini: ${response.statusText}`);

    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text;
    
    try {
      const extractedData = JSON.parse(jsonText.replace(/```json\n?|\n?```/g, ''));
      return { ...extractedData, id: extractedData.chaveAcesso, tipo: 'saida', status: 'processando' } as NFEData;
    } catch (e) {
      console.error("Erro ao analisar JSON da IA (XML):", jsonText);
      throw new Error("A IA retornou uma resposta em formato inválido para o XML.");
    }
  }

  static async processPDF(file: File, geminiApiKey: string): Promise<NFEData> {
    if (!geminiApiKey) throw new Error("A chave da API do Gemini não foi fornecida.");
    
    const base64Data = await fileToBase64(file);
    const prompt = `Você é um especialista em processar documentos fiscais. Analise a imagem ou texto do arquivo PDF de NF-e/DANFE em anexo. Extraia as informações e retorne APENAS um objeto JSON válido, sem nenhum texto extra. ${JSON_SCHEMA_PROMPT}`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: file.type, data: base64Data } }
        ]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`Erro na API do Gemini para PDF: ${response.statusText}`);
    
    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text;

    try {
      const extractedData = JSON.parse(jsonText.replace(/```json\n?|\n?```/g, ''));
       return { ...extractedData, id: extractedData.chaveAcesso, tipo: 'entrada', status: 'processando' } as NFEData;
    } catch (e) {
      console.error("Erro ao analisar JSON da IA (PDF):", jsonText);
      throw new Error("A IA retornou uma resposta em formato inválido para o PDF.");
    }
  }

  static validateNFE(nfeData: NFEData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!nfeData.chaveAcesso || (nfeData.chaveAcesso.length !== 44 && nfeData.chaveAcesso !== '0'.repeat(44))) errors.push('Chave de acesso inválida');
    if (!nfeData.emitente.cnpj) errors.push('CNPJ do emitente inválido');
    return { valid: errors.length === 0, errors };
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