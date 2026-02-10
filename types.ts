export interface Metadata {
  filename: string; // Name of the main file or "Combined Files"
  orgao: string;
  numero: string;
  objeto: string;
  data_abertura?: string;
  horario_abertura?: string;
  modo_disputa?: string;
  portal?: string;
  valor_estimado?: string;
}

export interface CitationItem {
  descricao: string; // The exact requirement text
  citation: string;  // File + Item number
  status: 'critical' | 'warning' | 'info';
}

export interface GoNoGo {
  garantia_proposta: CitationItem; // Bid Bond
  patrimonio_liquido: CitationItem; // 10% value usually
  visita_tecnica: CitationItem;
  amostra: CitationItem;
}

export interface Rules {
  prazo_entrega: { value: string; citation: string };
  vigencia: { value: string; citation: string };
  condicao_equipamentos: { value: string; citation: string };
}

export interface DocItem {
  requisito: string;
  citation: string;
}

export interface HabilitationDocs {
  juridica: DocItem[];
  fiscal_trabalhista: DocItem[];
  qualificacao_tecnica: DocItem[];
  qualificacao_economica: DocItem[];
  equipe_tecnica: DocItem[]; // Engineers, Technicians, specialized staff
}

export interface BidItem {
  id: number;
  nome: string;
  quantidade: string;
  unidade: string;
  citation: string;
  specs: string[]; // Detailed specs from TR
}

export interface AnalysisResult {
  metadata: Metadata;
  go_no_go: GoNoGo;
  regras: Rules;
  habilitacao: HabilitationDocs;
  itens: BidItem[];
}