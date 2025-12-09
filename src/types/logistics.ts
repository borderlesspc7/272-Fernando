import type { Timestamp } from "firebase/firestore";

export type DispatchStatus =
  | "pending"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export type DispatchPriority = "low" | "normal" | "high" | "urgent";

export type TransportType =
  | "moto"
  | "carro"
  | "van"
  | "transportadora"
  | "correios";

export interface TrackingEvent {
  id: string;
  status: DispatchStatus;
  description: string;
  location?: string;
  createdAt: Date | Timestamp;
  createdBy: string;
}

export interface DispatchDocument {
  id: string;
  name: string;
  type: "delivery_proof" | "signature" | "photo" | "invoice" | "other";
  url: string;
  uploadedAt: Date | Timestamp;
  uploadedBy: string;
}

export interface Dispatch {
  id: string;

  saleId?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress: string;

  items: {
    itemId: string;
    itemName: string;
    model: string;
    serialNumber?: string;
    quantity: number;
  }[];

  transportType: TransportType;
  trackingCode?: string;
  carrier?: string;

  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;

  status: DispatchStatus;
  priority: DispatchPriority;

  dispatchDate: Date | Timestamp;
  estimatedDeliveryDate?: Date | Timestamp;
  actualDeliveryDate?: Date | Timestamp;

  origin?: string;
  destination: string;
  currentLocation?: string;

  trackingEvents: TrackingEvent[];

  documents: DispatchDocument[];

  notes?: string;
  deliveryNotes?: string;
  recipientName?: string;
  recipientDocument?: string;

  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

export interface CreateDispatchData {
  saleId?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress: string;
  items: {
    itemId: string;
    itemName: string;
    model: string;
    serialNumber?: string;
    quantity: number;
  }[];
  transportType: TransportType;
  trackingCode?: string;
  carrier?: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  priority?: DispatchPriority;
  dispatchDate: Date;
  estimatedDeliveryDate?: Date;
  origin?: string;
  destination: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateDispatchData {
  status?: DispatchStatus;
  priority?: DispatchPriority;
  trackingCode?: string;
  carrier?: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  currentLocation?: string;
  notes?: string;
  deliveryNotes?: string;
  recipientName?: string;
  recipientDocument?: string;
}

export interface DispatchFilters {
  status?: DispatchStatus;
  priority?: DispatchPriority;
  transportType?: TransportType;
  technicianId?: string;
  clientId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DispatchStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  failed: number;
  avgDeliveryTime: number;
  onTimeDeliveryRate: number;
}

export const DISPATCH_STATUS_LABELS: Record<DispatchStatus, string> = {
  pending: "Aguardando Despacho",
  in_transit: "Em Trânsito",
  out_for_delivery: "Saiu para Entrega",
  delivered: "Entregue",
  failed: "Falha na Entrega",
  returned: "Devolvido",
};

export const DISPATCH_PRIORITY_LABELS: Record<DispatchPriority, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

export const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  moto: "Moto",
  carro: "Carro",
  van: "Van",
  transportadora: "Transportadora",
  correios: "Correios",
};

export const DOCUMENT_TYPE_LABELS: Record<DispatchDocument["type"], string> = {
  delivery_proof: "Comprovante de Entrega",
  signature: "Assinatura",
  photo: "Foto",
  invoice: "Nota Fiscal",
  other: "Outro",
};
