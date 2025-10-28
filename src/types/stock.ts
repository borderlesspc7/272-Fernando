import type { Timestamp } from "firebase/firestore";

// Categoria do equipamento
export type EquipmentCategory =
  | "router"
  | "switch"
  | "converter"
  | "cable"
  | "camera"
  | "accessory"
  | "other";

// Status do item no estoque
export type StockStatus =
  | "available" // Disponível
  | "reserved" // Reservado para venda
  | "separated" // Separado para despacho
  | "dispatched" // Despachado
  | "in_maintenance" // Em manutenção
  | "defective"; // Defeituoso

// Tipo de movimentação
export type MovementType =
  | "entry" // Entrada
  | "exit" // Saída
  | "transfer" // Transferência
  | "adjustment" // Ajuste de inventário
  | "return" // Retorno
  | "loss"; // Perda/Avaria

// Localização física
export interface StockLocation {
  warehouse: string; // Almoxarifado
  shelf?: string; // Prateleira
  position?: string; // Posição
}

// Item de estoque
export interface StockItem {
  id: string;
  name: string; // Nome do equipamento
  model: string; // Modelo
  category: EquipmentCategory;
  manufacturer?: string; // Fabricante

  // Controle de quantidade
  quantity: number; // Quantidade em estoque
  reservedQuantity: number; // Quantidade reservada
  minimumStock: number; // Estoque mínimo

  // Localização
  location: StockLocation;

  // Status
  status: StockStatus;

  // Informações adicionais
  unitPrice?: number; // Preço unitário
  supplier?: string; // Fornecedor principal
  notes?: string;

  // Controle
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

// Entrada de equipamento
export interface StockEntry {
  id: string;
  itemId: string; // ID do item de estoque
  itemName: string; // Nome (denormalizado)

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // Fornecedor
  supplier: string;
  invoiceNumber?: string; // Número da nota fiscal
  invoiceDate?: Date | Timestamp;

  // Recebimento
  receivedBy: string;
  receivedDate: Date | Timestamp;

  notes?: string;

  createdAt: Date | Timestamp;
  createdBy: string;
}

// Saída/Despacho de equipamento
export interface StockDispatch {
  id: string;

  // Items despachados
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
  }[];

  // Venda vinculada
  saleId?: string;
  clientId?: string;
  clientName?: string;

  // Despacho
  destination: string; // Endereço de destino
  dispatchDate: Date | Timestamp;
  dispatchedBy: string;

  // Responsável pela instalação
  technician?: string;
  technicianContact?: string;

  // Status
  status: "pending" | "dispatched" | "delivered" | "cancelled";

  // Tracking
  trackingCode?: string;
  estimatedDelivery?: Date | Timestamp;
  actualDelivery?: Date | Timestamp;

  notes?: string;

  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

// Movimentação de estoque (histórico)
export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;

  type: MovementType;
  quantity: number; // Positivo para entrada, negativo para saída

  // Referências
  referenceId?: string; // ID da entrada, saída, etc
  referenceType?: "entry" | "dispatch" | "sale" | "maintenance" | "other";

  // Detalhes
  description: string;
  performedBy: string;

  // Estoque antes e depois
  previousQuantity: number;
  newQuantity: number;

  createdAt: Date | Timestamp;
}

// Dados para criar item
export interface CreateStockItemData {
  name: string;
  model: string;
  category: EquipmentCategory;
  manufacturer?: string;
  quantity: number;
  minimumStock: number;
  location: StockLocation;
  status?: StockStatus;
  unitPrice?: number;
  supplier?: string;
  notes?: string;
  createdBy: string;
}

// Dados para atualizar item
export interface UpdateStockItemData {
  name?: string;
  model?: string;
  category?: EquipmentCategory;
  manufacturer?: string;
  minimumStock?: number;
  location?: StockLocation;
  status?: StockStatus;
  unitPrice?: number;
  supplier?: string;
  notes?: string;
}

// Dados para entrada
export interface CreateStockEntryData {
  itemId: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  notes?: string;
  createdBy: string;
}

// Dados para despacho
export interface CreateStockDispatchData {
  items: {
    itemId: string;
    quantity: number;
  }[];
  saleId?: string;
  clientId?: string;
  destination: string;
  dispatchDate: Date;
  technician?: string;
  technicianContact?: string;
  trackingCode?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdBy: string;
}

// Filtros
export interface StockFilters {
  category?: EquipmentCategory;
  status?: StockStatus;
  warehouse?: string;
  search?: string;
  lowStock?: boolean; // Apenas itens com estoque baixo
}

// Ordem de separação (gerada pela venda)
export interface SeparationOrder {
  id: string;

  // Venda vinculada
  saleId: string;
  clientId: string;
  clientName: string;
  planName: string;

  // Equipamentos necessários
  items: {
    itemId: string;
    itemName: string;
    model: string;
    quantity: number;
    separated: boolean;
  }[];

  // Status
  status: "pending" | "separating" | "ready" | "dispatched" | "cancelled";

  // Prazo
  deadline?: Date | Timestamp;

  // Datas
  createdAt: Date | Timestamp;
  startedAt?: Date | Timestamp;
  completedAt?: Date | Timestamp;

  // Responsáveis
  createdBy: string;
  separatedBy?: string;

  notes?: string;
}

// Estatísticas
export interface StockStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  availableItems: number;
  reservedItems: number;
  dispatchedItems: number;
  defectiveItems: number;
  pendingSeparations: number;
  categories: {
    category: EquipmentCategory;
    count: number;
  }[];
}

// Labels para exibição
export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  router: "Roteador",
  switch: "Switch",
  converter: "Conversor",
  cable: "Cabo",
  camera: "Câmera",
  accessory: "Acessório",
  other: "Outros",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  separated: "Separado",
  dispatched: "Despachado",
  in_maintenance: "Em Manutenção",
  defective: "Defeituoso",
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entry: "Entrada",
  exit: "Saída",
  transfer: "Transferência",
  adjustment: "Ajuste",
  return: "Retorno",
  loss: "Perda/Avaria",
};

export const SEPARATION_STATUS_LABELS: Record<
  SeparationOrder["status"],
  string
> = {
  pending: "Pendente",
  separating: "Em Separação",
  ready: "Pronto",
  dispatched: "Despachado",
  cancelled: "Cancelado",
};
