import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceFilters,
  InvoiceStats,
} from "../types/billing";
import { prepareForFirestore } from "../utils/firebaseHelpers";

const COLLECTION = "invoices";

const convertTimestampToDate = (data: Invoice): Invoice => {
  return {
    ...data,
    dueDate:
      data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
    paidAt:
      data.paidAt instanceof Timestamp ? data.paidAt.toDate() : data.paidAt,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt,
  };
};

export const billingService = {
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const ref = doc(collection(db, COLLECTION));
    const now = Timestamp.now();

    const invoice: Invoice = {
      id: ref.id,
      saleId: data.saleId,
      clientId: data.clientId,
      clientName: data.clientName,
      description: data.description,
      amount: data.amount,
      originalAmount: data.amount,
      dueDate: Timestamp.fromDate(data.dueDate),
      status: "open",
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now,
      createdBy: data.createdBy,
    };

    const cleaned = prepareForFirestore(invoice);
    await setDoc(ref, cleaned);
    return convertTimestampToDate(invoice);
  },

  async markAsPaid(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Fatura não encontrada");

    const updates: UpdateInvoiceData = {
      status: data.status ?? "paid",
      paymentStatus: data.paymentStatus ?? "paid",
      paidAt: data.paidAt ?? new Date(),
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    };

    const cleaned = prepareForFirestore({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    await updateDoc(ref, cleaned);
    const updated = await getDoc(ref);
    return convertTimestampToDate(updated.data() as Invoice);
  },

  async getInvoicesByFilters(filters: InvoiceFilters = {}): Promise<Invoice[]> {
    const ref = collection(db, COLLECTION);
    const constraints = [];

    if (filters.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.clientId) {
      constraints.push(where("clientId", "==", filters.clientId));
    }
    if (filters.saleId) {
      constraints.push(where("saleId", "==", filters.saleId));
    }

    const q = constraints.length
      ? query(ref, ...constraints, orderBy("dueDate", "asc"))
      : query(ref, orderBy("dueDate", "asc"));

    const snap = await getDocs(q);
    let invoices = snap.docs.map((d) =>
      convertTimestampToDate(d.data() as Invoice)
    );

    if (filters.search) {
      const term = filters.search.toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(term) ||
          inv.description.toLowerCase().includes(term)
      );
    }

    if (filters.dateFrom) {
      invoices = invoices.filter(
        (inv) =>
          (inv.dueDate as Date) >= (filters.dateFrom as Date)
      );
    }
    if (filters.dateTo) {
      invoices = invoices.filter(
        (inv.dueDate as Date) <= (filters.dateTo as Date)
      );
    }

    return invoices;
  },

  async getStats(): Promise<InvoiceStats> {
    const invoices = await this.getInvoicesByFilters();

    const result: InvoiceStats = {
      total: invoices.length,
      open: invoices.filter((i) => i.status === "open").length,
      paid: invoices.filter((i) => i.status === "paid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      cancelled: invoices.filter((i) => i.status === "cancelled").length,
      totalOpenAmount: invoices
        .filter((i) => i.status === "open")
        .reduce((sum, i) => sum + i.amount, 0),
      totalOverdueAmount: invoices
        .filter((i) => i.status === "overdue")
        .reduce((sum, i) => sum + i.amount, 0),
    };

    return result;
  },
};

