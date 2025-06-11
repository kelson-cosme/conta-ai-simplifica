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
    icms: {
      base: number;
      aliquota: number;
      valor: number;
    };
    ipi: {
      base: number;
      aliquota: number;
      valor: number;
    };
    pis: {
      base: number;
      aliquota: number;
      valor: number;
    };
    cofins: {
      base: number;
      aliquota: number;
      valor: number;
    };
  }>;
  totais: {
    baseIcms: number;
    valorIcms: number;
    baseIcmsSt: number;
    valorIcmsSt: number;
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
  chaveAcesso: string;
  protocolo?: string;
  status: 'processando' | 'validada' | 'cancelada' | 'erro';
}

export class NFEParser {
  static parseXML(xmlContent: string): NFEData {
    // Simular parsing de XML de NF-e
    // Em produção, usaria uma biblioteca como xml2js ou similar
    
    const mockData: NFEData = {
      id: Math.random().toString(36).substr(2, 9),
      numero: Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
      serie: '001',
      dataEmissao: new Date().toISOString().split('T')[0],
      tipo: Math.random() > 0.5 ? 'entrada' : 'saida',
      emitente: {
        cnpj: '12.345.678/0001-90',
        razaoSocial: 'EMPRESA EMITENTE LTDA',
        nomeFantasia: 'Empresa Emitente',
        endereco: 'Rua das Flores, 123',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01234-567'
      },
      destinatario: {
        cnpj: '98.765.432/0001-01',
        razaoSocial: 'EMPRESA DESTINATARIA LTDA',
        endereco: 'Av. Principal, 456',
        municipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20000-000'
      },
      produtos: [
        {
          codigo: 'PROD001',
          descricao: 'Produto de Exemplo',
          ncm: '12345678',
          cfop: '5102',
          unidade: 'UN',
          quantidade: 10,
          valorUnitario: 100,
          valorTotal: 1000,
          icms: { base: 1000, aliquota: 18, valor: 180 },
          ipi: { base: 1000, aliquota: 5, valor: 50 },
          pis: { base: 1000, aliquota: 1.65, valor: 16.5 },
          cofins: { base: 1000, aliquota: 7.6, valor: 76 }
        },
        {
          codigo: 'PROD002',
          descricao: 'Outro Produto',
          ncm: '87654321',
          cfop: '5102',
          unidade: 'KG',
          quantidade: 5,
          valorUnitario: 200,
          valorTotal: 1000,
          icms: { base: 1000, aliquota: 12, valor: 120 },
          ipi: { base: 1000, aliquota: 0, valor: 0 },
          pis: { base: 1000, aliquota: 1.65, valor: 16.5 },
          cofins: { base: 1000, aliquota: 7.6, valor: 76 }
        }
      ],
      totais: {
        baseIcms: 2000,
        valorIcms: 300,
        baseIcmsSt: 0,
        valorIcmsSt: 0,
        valorProdutos: 2000,
        valorFrete: 0,
        valorSeguro: 0,
        valorDesconto: 0,
        valorIpi: 50,
        valorPis: 33,
        valorCofins: 152,
        valorNota: 2050
      },
      observacoes: 'Nota fiscal de exemplo processada automaticamente',
      chaveAcesso: '35' + new Date().getFullYear() + '12345678000190001' + Math.floor(Math.random() * 999999999).toString().padStart(9, '0'),
      protocolo: '135' + Date.now(),
      status: 'validada'
    };

    return mockData;
  }

  static async processPDF(file: File): Promise<NFEData> {
    // Simular OCR e extração de dados de PDF
    // Em produção, usaria serviços como Tesseract.js ou APIs de OCR
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simular processamento

    const mockData: NFEData = {
      id: Math.random().toString(36).substr(2, 9),
      numero: Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
      serie: '001',
      dataEmissao: new Date().toISOString().split('T')[0],
      tipo: 'entrada',
      emitente: {
        cnpj: '11.222.333/0001-44',
        razaoSocial: 'FORNECEDOR EXEMPLO S/A',
        nomeFantasia: 'Fornecedor Exemplo',
        endereco: 'Av. Comercial, 789',
        municipio: 'Belo Horizonte',
        uf: 'MG',
        cep: '30000-000'
      },
      destinatario: {
        cnpj: '55.666.777/0001-88',
        razaoSocial: 'MINHA EMPRESA LTDA',
        endereco: 'Rua da Empresa, 100',
        municipio: 'Salvador',
        uf: 'BA',
        cep: '40000-000'
      },
      produtos: [
        {
          codigo: 'PDF001',
          descricao: 'Produto extraído do PDF',
          ncm: '99999999',
          cfop: '1102',
          unidade: 'PC',
          quantidade: 1,
          valorUnitario: 500,
          valorTotal: 500,
          icms: { base: 500, aliquota: 18, valor: 90 },
          ipi: { base: 500, aliquota: 10, valor: 50 },
          pis: { base: 500, aliquota: 1.65, valor: 8.25 },
          cofins: { base: 500, aliquota: 7.6, valor: 38 }
        }
      ],
      totais: {
        baseIcms: 500,
        valorIcms: 90,
        baseIcmsSt: 0,
        valorIcmsSt: 0,
        valorProdutos: 500,
        valorFrete: 0,
        valorSeguro: 0,
        valorDesconto: 0,
        valorIpi: 50,
        valorPis: 8.25,
        valorCofins: 38,
        valorNota: 550
      },
      observacoes: 'Dados extraídos automaticamente do PDF via OCR',
      chaveAcesso: '31' + new Date().getFullYear() + '11222333000144001' + Math.floor(Math.random() * 999999999).toString().padStart(9, '0'),
      status: 'validada'
    };

    return mockData;
  }

  static validateNFE(nfeData: NFEData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar chave de acesso
    if (!nfeData.chaveAcesso || nfeData.chaveAcesso.length !== 44) {
      errors.push('Chave de acesso inválida');
    }

    // Validar CNPJ do emitente
    if (!nfeData.emitente.cnpj || !this.isValidCNPJ(nfeData.emitente.cnpj)) {
      errors.push('CNPJ do emitente inválido');
    }

    // Validar totais
    const somaImpostos = nfeData.totais.valorIcms + nfeData.totais.valorIpi + 
                        nfeData.totais.valorPis + nfeData.totais.valorCofins;
    const valorEsperado = nfeData.totais.valorProdutos + somaImpostos + 
                         nfeData.totais.valorFrete - nfeData.totais.valorDesconto;
    
    if (Math.abs(valorEsperado - nfeData.totais.valorNota) > 0.01) {
      errors.push('Inconsistência nos valores totais da nota');
    }

    // Validar produtos
    if (!nfeData.produtos || nfeData.produtos.length === 0) {
      errors.push('Nota deve conter pelo menos um produto');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static isValidCNPJ(cnpj: string): boolean {
    // Simplificada - em produção usaria validação completa
    const numbers = cnpj.replace(/[^\d]/g, '');
    return numbers.length === 14;
  }

  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  static formatCNPJ(cnpj: string): string {
    const numbers = cnpj.replace(/[^\d]/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}