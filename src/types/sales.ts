import type { Timestamp } from "firebase/firestore";

// Status da venda na jornada
export type SaleStatus =
  | "pending" // Aguardando processamento
  | "in_progress" // Em andamento
  | "stock_separated" // Estoque separado
  | "dispatched" // Despachado para instalação
  | "installing" // Em instalação
  | "active" // Instalado e ativo
  | "cancelled" // Cancelado
  | "suspended"; // Suspenso

// Status de pagamento
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";

// Tipo de plano
export interface Plan {
  id: string;
  name: string;
  description?: string;
  value: number;
  installationFee?: number;
  features?: string[];
}

// Equipamento associado à venda
export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber?: string;
  quantity: number;
  status: "pending" | "separated" | "dispatched" | "installed";
}

// Documento anexado
export interface SaleDocument {
  id: string;
  name: string;
  type: "contract" | "payment_proof" | "installation_photo" | "other";
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

  // Equipamentos
  equipments: Equipment[];

  // Pagamento
  payment: Payment;

  // Status
  status: SaleStatus;

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
    id: "plan-replay-gold",
    name: "Replay Gold",
    description: "Plano premium com recursos avançados",
    value: 199.9,
    installationFee: 99.9,
    features: ["Suporte 24/7", "Equipamentos premium", "Instalação grátis"],
  },
  {
    id: "plan-replay-silver",
    name: "Replay Silver",
    description: "Plano intermediário com ótimo custo-benefício",
    value: 149.9,
    installationFee: 79.9,
    features: ["Suporte em horário comercial", "Equipamentos padrão"],
  },
  {
    id: "plan-replay-bronze",
    name: "Replay Bronze",
    description: "Plano básico ideal para iniciantes",
    value: 99.9,
    installationFee: 59.9,
    features: ["Suporte por email", "Equipamentos básicos"],
  },
  {
    id: "plan-replay-business",
    name: "Replay Business",
    description: "Plano empresarial com recursos corporativos",
    value: 299.9,
    installationFee: 149.9,
    features: [
      "Suporte dedicado",
      "SLA garantido",
      "Equipamentos empresariais",
    ],
  },
];

// Templates de equipamentos por plano
export const EQUIPMENT_TEMPLATES: Record<string, Omit<Equipment, "id">[]> = {
  "plan-replay-gold": [
    {
      name: "Roteador Premium",
      model: "RT-5000",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Conversor Óptico",
      model: "CO-300",
      quantity: 1,
      status: "pending",
    },
    { name: "Cabo de Rede 10m", model: "CAT6", quantity: 1, status: "pending" },
  ],
  "plan-replay-silver": [
    {
      name: "Roteador Padrão",
      model: "RT-3000",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Conversor Óptico",
      model: "CO-200",
      quantity: 1,
      status: "pending",
    },
  ],
  "plan-replay-bronze": [
    {
      name: "Roteador Básico",
      model: "RT-1000",
      quantity: 1,
      status: "pending",
    },
  ],
  "plan-replay-business": [
    {
      name: "Roteador Empresarial",
      model: "RT-7000",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Switch Gerenciável",
      model: "SW-24P",
      quantity: 1,
      status: "pending",
    },
    {
      name: "Conversor Óptico",
      model: "CO-500",
      quantity: 2,
      status: "pending",
    },
    {
      name: "Cabo de Rede 15m",
      model: "CAT6A",
      quantity: 2,
      status: "pending",
    },
  ],
};
