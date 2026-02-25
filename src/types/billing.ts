import type { Timestamp } from "firebase/firestore";
import type { PaymentStatus } from "./sales";

export type InvoiceStatus = "open" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;

  // Referências
  saleId: string;
  clientId: string;
  clientName: string;

  // Valores
  description: string;
  amount: number;
  originalAmount?: number; // antes de desconto

  // Datas
  dueDate: Date | Timestamp;
  paidAt?: Date | Timestamp;

  // Status
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;

  // Pagamento
  paymentMethod?: "credit_card" | "debit_card" | "bank_slip" | "pix" | "cash";
  notes?: string;

  // Controle
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

export interface CreateInvoiceData {
  saleId: string;
  clientId: string;
  clientName: string;
  description: string;
  amount: number;
  dueDate: Date;
  createdBy: string;
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: Invoice["paymentMethod"];
  paidAt?: Date;
  notes?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  saleId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InvoiceStats {
  total: number;
  open: number;
  paid: number;
  overdue: number;
  cancelled: number;
  totalOpenAmount: number;
  totalOverdueAmount: number;
}

