import type { Timestamp } from "firebase/firestore";

export type InstallationStatus = "pending" | "in_progress" | "completed";

export interface InstallationPhoto {
  id: string;
  url: string;
  description?: string;
  uploadedAt: Date | Timestamp;
  uploadedBy: string;
}

export interface Installation {
  id: string;
  saleId?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  status: InstallationStatus;
  scheduledDate: Date | Timestamp;
  startedAt?: Date | Timestamp;
  completedAt?: Date | Timestamp;
  equipments: {
    itemId: string;
    itemName: string;
    model: string;
    serialNumber?: string;
    quantity: number;
  }[];
  photos: InstallationPhoto[];
  invoiceNumber?: string; // Número da nota fiscal
  invoiceDate?: Date | Timestamp; // Data da nota fiscal
  invoiceUrl?: string; // URL do documento da nota fiscal
  progress?: number; // Progresso da instalação (0-100%)
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

export interface CreateInstallationData {
  saleId?: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAddress: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  scheduledDate: Date;
  equipments: {
    itemId: string;
    itemName: string;
    model: string;
    serialNumber?: string;
    quantity: number;
  }[];
  notes?: string;
  createdBy: string;
}

export interface UpdateInstallationData {
  status?: InstallationStatus;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface InstallationFilters {
  status?: InstallationStatus;
  technicianId?: string;
  clientId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const INSTALLATION_STATUS_LABELS: Record<InstallationStatus, string> = {
  pending: "Pendente",
  in_progress: "Em Execução",
  completed: "Concluída",
};
