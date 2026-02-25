import type { Timestamp } from "firebase/firestore";

// Status da venda na jornada
export type SaleStatus =
  | "pending" // Aguardando processamento
  | "analyzing_stock" // Análise de estoque e montagem
  | "in_progress" // Em andamento
  | "stock_separated" // Estoque separado
  | "dispatched" // Despachado para instalação
  | "installing" // Em instalação
  | "active" // Instalado e ativo
  | "cancelled" // Cancelado
  | "suspended"; // Suspenso

// Status de pagamento
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

// Categoria de oferta comercial
export type OfferCategory = "basic" | "intermediate" | "premium";

// Forma de contratação
export type ContractType =
  | "monthly_advance" // Antecipação de mensalidade
  | "simplified_adhesion" // Adesão simplificada
  | "equipment_sale"; // Venda de equipamento

// Tipo de plano
export interface Plan {
  id: string;
  name: string;
  description?: string;
  value: number;
  installationFee?: number;
  features?: string[];
  category?: OfferCategory; // Categoria da oferta (básico, intermediário, prêmio)
  maxDiscountPercent?: number; // Desconto máximo permitido (ex: 20 = 20%)
  isActive?: boolean; // Se o plano está ativo para venda
}

// Tipo de equipamento
export type EquipmentType = 
  | "court" // Quadra
  | "camera" // Câmera
  | "banner" // Banner
  | "router" // Roteador
  | "converter" // Conversor
  | "cable" // Cabo
  | "other"; // Outros

// Equipamento associado à venda
export interface Equipment {
  id: string;
  name: string;
  model: string;
  type?: EquipmentType;
  serialNumber?: string;
  quantity: number;
  status: "pending" | "separated" | "dispatched" | "installed";
  notes?: string; // Observações sobre o equipamento
}

// Documento anexado
export interface SaleDocument {
  id: string;
  name: string;
  type: 
    | "signed_proposal" // Proposta assinada
    | "contract" // Contrato
    | "client_documents" // Documentos do cliente
    | "payment_proof" // Comprovante de pagamento
    | "installation_photo" // Foto de instalação
    | "other"; // Outros
  url: string; // Simulado - URL fictícia
  uploadedAt: Date | Timestamp;
  uploadedBy: string;
}

// Timeline da jornada
export interface TimelineEvent {
  id: string;
  status: SaleStatus;
  description: string;
  createdAt: Date | Timestamp;
  createdBy: string;
  notes?: string;
}

// Dados de pagamento
export interface Payment {
  totalValue: number;
  installationFee: number;
  firstPaymentDate?: Date | Timestamp;
  paymentMethod?: "credit_card" | "debit_card" | "bank_slip" | "pix" | "cash";
  paymentStatus: PaymentStatus;
}

// Venda/Contrato principal
export interface Sale {
  id: string;

  // Cliente
  clientId: string;
  clientName: string; // Denormalizado para facilitar busca

  // Plano
  plan: Plan;

  // Forma de contratação
  contractType?: ContractType;

  // Equipamentos
  equipments: Equipment[];

  // Pagamento
  payment: Payment;

  // Status
  status: SaleStatus;

  // Progresso da instalação (0-100%)
  progress?: number;

  // Endereço de instalação
  installationAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Datas importantes
  saleDate: Date | Timestamp;
  estimatedInstallationDate?: Date | Timestamp;
  actualInstallationDate?: Date | Timestamp;
  activationDate?: Date | Timestamp;

  // Documentos
  documents: SaleDocument[];

  // Timeline
  timeline: TimelineEvent[];

  // Observações
  notes?: string;
  internalNotes?: string;

  // Controle
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;

  // IDs relacionados
  stockOrderId?: string;
  serviceOrderId?: string;
}

// Dados para criar uma venda
export interface CreateSaleData {
  clientId: string;
  clientName: string;
  plan: Plan;
  contractType?: ContractType;
  equipments: Equipment[];
  payment: Payment;
  installationAddress: Sale["installationAddress"];
  estimatedInstallationDate?: Date;
  notes?: string;
  createdBy: string;
}

// Dados para atualizar uma venda
export interface UpdateSaleData {
  plan?: Plan;
  equipments?: Equipment[];
  payment?: Payment;
  status?: SaleStatus;
  installationAddress?: Sale["installationAddress"];
  estimatedInstallationDate?: Date;
  actualInstallationDate?: Date;
  activationDate?: Date;
  notes?: string;
  internalNotes?: string;
}

// Filtros de busca
export interface SaleFilters {
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  clientId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minValue?: number;
  maxValue?: number;
}

// Resultado paginado
export interface PaginatedSales {
  sales: Sale[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Estatísticas
export interface SaleStats {
  total: number;
  pending: number;
  inProgress: number;
  active: number;
  cancelled: number;
  totalRevenue: number;
  averageTicket: number;
  thisMonthSales: number;
  thisMonthRevenue: number;
}

// Planos disponíveis no sistema
export const AVAILABLE_PLANS: Plan[] = [
  {
    id: "plan-replay-bronze",
    name: "Replay Bronze",
    description: "Plano básico ideal para iniciantes",
    value: 99.9,
    installationFee: 59.9,
    category: "basic",
    features: ["Suporte por email", "Equipamentos básicos"],
  },
  {
    id: "plan-replay-silver",
    name: "Replay Silver",
    description: "Plano intermediário com ótimo custo-benefício",
    value: 149.9,
    installationFee: 79.9,
    category: "intermediate",
    features: ["Suporte em horário comercial", "Equipamentos padrão"],
  },
  {
    id: "plan-replay-gold",
    name: "Replay Gold",
    description: "Plano premium com recursos avançados",
    value: 199.9,
    installationFee: 99.9,
    category: "premium",
    features: ["Suporte 24/7", "Equipamentos premium", "Instalação grátis"],
  },
  {
    id: "plan-replay-business",
    name: "Replay Business",
    description: "Plano empresarial com recursos corporativos",
    value: 299.9,
    installationFee: 149.9,
    category: "premium",
    features: [
      "Suporte dedicado",
      "SLA garantido",
      "Equipamentos empresariais",
    ],
  },
];

// Templates de equipamentos por plano
export const EQUIPMENT_TEMPLATES: Record<string, Omit<Equipment, "id">[]> = {
  "plan-replay-bronze": [
    {
      name: "Roteador Básico",
      model: "RT-1000",
      type: "router",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Câmera HD",
      model: "CAM-HD-720",
      type: "camera",
      quantity: 1,
      status: "pending",
    },
  ],
  "plan-replay-silver": [
    {
      name: "Roteador Padrão",
      model: "RT-3000",
      type: "router",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Conversor Óptico",
      model: "CO-200",
      type: "converter",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Câmera Full HD",
      model: "CAM-FHD-1080",
      type: "camera",
      quantity: 2,
      status: "pending",
    },
    {
      name: "Banner Publicitário",
      model: "BAN-STANDARD",
      type: "banner",
      quantity: 1,
      status: "pending",
    },
  ],
  "plan-replay-gold": [
    {
      name: "Roteador Premium",
      model: "RT-5000",
      type: "router",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Conversor Óptico",
      model: "CO-300",
      type: "converter",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Câmera 4K",
      model: "CAM-4K-UHD",
      type: "camera",
      quantity: 4,
      status: "pending",
    },
    {
      name: "Banner Premium",
      model: "BAN-PREMIUM",
      type: "banner",
      quantity: 2,
      status: "pending",
    },
    { 
      name: "Cabo de Rede 10m", 
      model: "CAT6", 
      type: "cable",
      quantity: 1, 
      status: "pending" 
    },
  ],
  "plan-replay-business": [
    {
      name: "Roteador Empresarial",
      model: "RT-7000",
      type: "router",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Conversor Óptico",
      model: "CO-500",
      type: "converter",
      quantity: 2,
      status: "pending",
    },
    {
      name: "Câmera 4K Pro",
      model: "CAM-4K-PRO",
      type: "camera",
      quantity: 8,
      status: "pending",
      notes: "Com visão noturna e AI"
    },
    {
      name: "Banner Digital",
      model: "BAN-DIGITAL",
      type: "banner",
      quantity: 4,
      status: "pending",
      notes: "Com telão LED"
    },
    {
      name: "Sistema Quadra Completo",
      model: "COURT-SYSTEM-PRO",
      type: "court",
      quantity: 1,
      status: "pending",
      notes: "Inclui sensores e iluminação"
    },
    {
      name: "Cabo de Rede 15m",
      model: "CAT6A",
      type: "cable",
      quantity: 2,
      status: "pending",
    },
  ],
};

// Labels para exibição
export const OFFER_CATEGORY_LABELS: Record<OfferCategory, string> = {
  basic: "Básico",
  intermediate: "Intermediário",
  premium: "Prêmio",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  monthly_advance: "Antecipação de Mensalidade",
  simplified_adhesion: "Adesão Simplificada",
  equipment_sale: "Venda de Equipamento",
};

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  court: "Quadra",
  camera: "Câmera",
  banner: "Banner",
  router: "Roteador",
  converter: "Conversor",
  cable: "Cabo",
  other: "Outros",
};

export const DOCUMENT_TYPE_LABELS: Record<SaleDocument["type"], string> = {
  signed_proposal: "Proposta Assinada",
  contract: "Contrato",
  client_documents: "Documentos do Cliente",
  payment_proof: "Comprovante de Pagamento",
  installation_photo: "Foto de Instalação",
  other: "Outros",
};

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  pending: "Pendente",
  analyzing_stock: "Análise de Estoque",
  in_progress: "Em Andamento",
  stock_separated: "Estoque Separado",
  dispatched: "Despachado",
  installing: "Em Instalação",
  active: "Ativo",
  cancelled: "Cancelado",
  suspended: "Suspenso",
};
