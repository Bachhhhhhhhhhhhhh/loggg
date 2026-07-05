export interface KnowledgeFormula {
  name: string;
  expression: string;
  variables: string;
  example?: string;
}

export interface KnowledgeCaseStudy {
  title: string;
  context: string;
  challenge: string;
  solution: string;
  result: string;
}

export interface KnowledgeFAQ {
  question: string;
  answer: string;
}

export interface KnowledgeGlossaryItem {
  term: string;
  definition: string;
}

export interface KnowledgeMetric {
  name: string;
  formula: string;
  benchmark: string;
  interpretation: string;
}

export interface KnowledgeSection {
  id: string;
  title: string;
  content: string;
  bullets?: string[];
}

/** Loại mô hình mô phỏng tương tác nhúng trong bài tri thức */
export type SimulationModelType =
  | "eoq"
  | "eoq-discount"
  | "safety-stock"
  | "service-level"
  | "monte-carlo"
  | "inventory-policy"
  | "abc-classify"
  | "abc-xyz-matrix"
  | "newsvendor"
  | "bullwhip"
  | "transport-lp"
  | "forecast-mape"
  | "carbon-transport"
  | "queueing-dock"
  | "sop-gap";

export interface KnowledgeSimulationModel {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  modelType: SimulationModelType;
  /** Cơ sở khoa học / công thức cốt lõi */
  scientificNote: string;
  /** Giả định mô hình — người dùng cần biết */
  assumptions: string[];
  /** Đầu ra mô phỏng */
  outputs: string[];
  /** Tham số mặc định (JSON-serializable) */
  defaultParams?: Record<string, number>;
}

export type KnowledgeDifficulty = "Cơ bản" | "Trung cấp" | "Nâng cao";
export type KnowledgeCategory =
  | "Phân tích"
  | "Tối ưu hóa"
  | "Tồn kho"
  | "Kho bãi"
  | "Vận tải"
  | "Thương mại QT"
  | "Machine Learning"
  | "Thư viện"
  | "Chiến lược"
  | "Mua hàng"
  | "Bền vững";

export interface KnowledgeEntry {
  id: string;
  title: string;
  subtitle: string;
  category: KnowledgeCategory;
  language: string;
  difficulty: KnowledgeDifficulty;
  readingTime: string;
  summary: string;
  overview: string;
  scientificBasis: string;
  whenToUse: string;
  whenNotToUse: string;
  vietnamContext?: string;
  keyConcepts: string[];
  applications: string[];
  methods: string[];
  stepByStep: string[];
  pitfalls: string[];
  formulas?: KnowledgeFormula[];
  metrics?: KnowledgeMetric[];
  caseStudies?: KnowledgeCaseStudy[];
  faq?: KnowledgeFAQ[];
  glossary?: KnowledgeGlossaryItem[];
  sections?: KnowledgeSection[];
  simulationModels?: KnowledgeSimulationModel[];
  pythonStack: string[];
  implementationNotes: string;
  relatedModuleIds: string[];
  relatedToolIds?: string[];
  codeExample?: string;
  tags?: string[];
}