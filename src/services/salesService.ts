import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { stockService } from "./stockService";
import type {
  Sale,
  CreateSaleData,
  UpdateSaleData,
  SaleFilters,
  SaleStats,
  TimelineEvent,
  SaleDocument,
} from "../types/sales";

const SALES_COLLECTION = "sales";

// Converter Timestamp para Date
const convertTimestampToDate = (data: Sale): Sale => {
  return {
    ...data,
    saleDate:
      data.saleDate instanceof Timestamp
        ? data.saleDate.toDate()
        : data.saleDate,
    estimatedInstallationDate:
      data.estimatedInstallationDate instanceof Timestamp
        ? data.estimatedInstallationDate.toDate()
        : data.estimatedInstallationDate,
    actualInstallationDate:
      data.actualInstallationDate instanceof Timestamp
        ? data.actualInstallationDate.toDate()
        : data.actualInstallationDate,
    activationDate:
      data.activationDate instanceof Timestamp
        ? data.activationDate.toDate()
        : data.activationDate,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt,
    payment: {
      ...data.payment,
      firstPaymentDate:
        data.payment.firstPaymentDate instanceof Timestamp
          ? data.payment.firstPaymentDate.toDate()
          : data.payment.firstPaymentDate,
    },
    timeline: data.timeline.map((event) => ({
      ...event,
      createdAt:
        event.createdAt instanceof Timestamp
          ? event.createdAt.toDate()
          : event.createdAt,
    })),
    documents: data.documents.map((doc) => ({
      ...doc,
      uploadedAt:
        doc.uploadedAt instanceof Timestamp
          ? doc.uploadedAt.toDate()
          : doc.uploadedAt,
    })),
  };
};

export const salesService = {
  // ========== CREATE ==========
  async createSale(data: CreateSaleData): Promise<Sale> {
    try {
      const saleRef = doc(collection(db, SALES_COLLECTION));
      const now = Timestamp.now();

      // Criar evento inicial da timeline
      const initialEvent: TimelineEvent = {
        id: `event-${Date.now()}`,
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: now,
        createdBy: data.createdBy,
      };

      const newSale: Sale = {
        id: saleRef.id,
        ...data,
        status: "pending",
        payment: {
          ...data.payment,
          paymentStatus: data.payment.paymentStatus || "pending",
        },
        saleDate: now,
        documents: [],
        timeline: [initialEvent],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(saleRef, newSale);

      // Criar ordem de separação no estoque
      try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 3); // Prazo de 3 dias

        await stockService.createSeparationOrder(
          saleRef.id,
          data.clientId,
          data.clientName,
          data.plan.name,
          data.equipments.map((equipment) => ({
            itemId: equipment.id,
            itemName: equipment.name,
            model: equipment.model,
            quantity: equipment.quantity,
          })),
          data.createdBy,
          deadline
        );
      } catch (stockError) {
        console.error("Erro ao criar ordem de separação:", stockError);
        // Não falha a venda se houver erro no estoque
      }

      return convertTimestampToDate(newSale);
    } catch (error) {
      console.error("Erro ao criar venda:", error);
      throw new Error("Não foi possível criar a venda. Tente novamente.");
    }
  },

  // ========== READ ==========
  async getSaleById(saleId: string): Promise<Sale | null> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      const saleSnap = await getDoc(saleRef);

      if (!saleSnap.exists()) {
        return null;
      }

      return convertTimestampToDate(saleSnap.data() as Sale);
    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      throw new Error("Não foi possível buscar a venda. Tente novamente.");
    }
  },

  async getAllSales(): Promise<Sale[]> {
    try {
      const salesRef = collection(db, SALES_COLLECTION);
      const q = query(salesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as Sale)
      );
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      throw new Error("Não foi possível buscar as vendas. Tente novamente.");
    }
  },

  async getSalesByFilters(filters: SaleFilters): Promise<Sale[]> {
    try {
      const salesRef = collection(db, SALES_COLLECTION);
      const constraints: QueryConstraint[] = [];

      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters.paymentStatus) {
        constraints.push(
          where("payment.paymentStatus", "==", filters.paymentStatus)
        );
      }

      if (filters.clientId) {
        constraints.push(where("clientId", "==", filters.clientId));
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(salesRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let sales = querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as Sale)
      );

      // Filtros client-side
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        sales = sales.filter(
          (sale) =>
            sale.clientName.toLowerCase().includes(searchLower) ||
            sale.plan.name.toLowerCase().includes(searchLower) ||
            sale.id.toLowerCase().includes(searchLower)
        );
      }

      if (filters.minValue !== undefined) {
        sales = sales.filter(
          (sale) => sale.payment.totalValue >= filters.minValue!
        );
      }

      if (filters.maxValue !== undefined) {
        sales = sales.filter(
          (sale) => sale.payment.totalValue <= filters.maxValue!
        );
      }

      if (filters.dateFrom) {
        sales = sales.filter((sale) => {
          const saleDate =
            sale.saleDate instanceof Date
              ? sale.saleDate
              : sale.saleDate instanceof Timestamp
              ? sale.saleDate.toDate()
              : new Date();
          return saleDate >= filters.dateFrom!;
        });
      }

      if (filters.dateTo) {
        sales = sales.filter((sale) => {
          const saleDate =
            sale.saleDate instanceof Date
              ? sale.saleDate
              : sale.saleDate instanceof Timestamp
              ? sale.saleDate.toDate()
              : new Date();
          return saleDate <= filters.dateTo!;
        });
      }

      return sales;
    } catch (error) {
      console.error("Erro ao buscar vendas com filtros:", error);
      throw new Error("Não foi possível buscar as vendas. Tente novamente.");
    }
  },

  // ========== UPDATE ==========
  async updateSale(saleId: string, data: UpdateSaleData): Promise<Sale> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      const saleSnap = await getDoc(saleRef);

      if (!saleSnap.exists()) {
        throw new Error("Venda não encontrada");
      }

      const updatedData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(saleRef, updatedData);

      const updatedSaleSnap = await getDoc(saleRef);
      return convertTimestampToDate(updatedSaleSnap.data() as Sale);
    } catch (error) {
      console.error("Erro ao atualizar venda:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a venda. Tente novamente."
      );
    }
  },

  async updateSaleStatus(
    saleId: string,
    status: Sale["status"],
    notes: string,
    userId: string
  ): Promise<void> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      const saleSnap = await getDoc(saleRef);

      if (!saleSnap.exists()) {
        throw new Error("Venda não encontrada");
      }

      const sale = saleSnap.data() as Sale;

      // Criar novo evento na timeline
      const newEvent: TimelineEvent = {
        id: `event-${Date.now()}`,
        status,
        description: this.getStatusDescription(status),
        createdAt: Timestamp.now(),
        createdBy: userId,
        notes,
      };

      await updateDoc(saleRef, {
        status,
        timeline: [...sale.timeline, newEvent],
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status. Tente novamente."
      );
    }
  },

  // ========== DOCUMENTS ==========
  async addDocument(
    saleId: string,
    document: Omit<SaleDocument, "id" | "uploadedAt">,
    userId: string
  ): Promise<void> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      const saleSnap = await getDoc(saleRef);

      if (!saleSnap.exists()) {
        throw new Error("Venda não encontrada");
      }

      const sale = saleSnap.data() as Sale;

      const newDocument: SaleDocument = {
        ...document,
        id: `doc-${Date.now()}`,
        uploadedAt: Timestamp.now(),
        uploadedBy: userId,
      };

      await updateDoc(saleRef, {
        documents: [...sale.documents, newDocument],
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      throw new Error(
        "Não foi possível adicionar o documento. Tente novamente."
      );
    }
  },

  // ========== DELETE ==========
  async deleteSale(saleId: string): Promise<void> {
    try {
      const saleRef = doc(db, SALES_COLLECTION, saleId);
      const saleSnap = await getDoc(saleRef);

      if (!saleSnap.exists()) {
        throw new Error("Venda não encontrada");
      }

      await deleteDoc(saleRef);
    } catch (error) {
      console.error("Erro ao deletar venda:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Não foi possível deletar a venda. Tente novamente."
      );
    }
  },

  // ========== STATISTICS ==========
  async getSaleStats(): Promise<SaleStats> {
    try {
      const sales = await this.getAllSales();
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonthSales = sales.filter((sale) => {
        const saleDate =
          sale.saleDate instanceof Date
            ? sale.saleDate
            : sale.saleDate instanceof Timestamp
            ? sale.saleDate.toDate()
            : new Date();
        return saleDate >= firstDayOfMonth;
      });

      const totalRevenue = sales.reduce(
        (sum, sale) => sum + sale.payment.totalValue,
        0
      );

      const thisMonthRevenue = thisMonthSales.reduce(
        (sum, sale) => sum + sale.payment.totalValue,
        0
      );

      return {
        total: sales.length,
        pending: sales.filter((s) => s.status === "pending").length,
        inProgress: sales.filter(
          (s) =>
            s.status === "in_progress" ||
            s.status === "stock_separated" ||
            s.status === "dispatched" ||
            s.status === "installing"
        ).length,
        active: sales.filter((s) => s.status === "active").length,
        cancelled: sales.filter((s) => s.status === "cancelled").length,
        totalRevenue,
        averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
        thisMonthSales: thisMonthSales.length,
        thisMonthRevenue,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw new Error(
        "Não foi possível buscar as estatísticas. Tente novamente."
      );
    }
  },

  // ========== HELPERS ==========
  getStatusDescription(status: Sale["status"]): string {
    const descriptions: Record<Sale["status"], string> = {
      pending: "Aguardando processamento",
      in_progress: "Venda em andamento",
      stock_separated: "Equipamentos separados no estoque",
      dispatched: "Equipamentos despachados para instalação",
      installing: "Instalação em andamento",
      active: "Instalação concluída - Cliente ativo",
      cancelled: "Venda cancelada",
      suspended: "Serviço suspenso",
    };

    return descriptions[status];
  },

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  formatDate(date: Date | Timestamp): string {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return new Intl.DateTimeFormat("pt-BR").format(d);
  },
};
