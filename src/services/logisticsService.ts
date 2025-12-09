import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Dispatch,
  CreateDispatchData,
  UpdateDispatchData,
  DispatchFilters,
  DispatchStats,
  TrackingEvent,
  DispatchDocument,
  DispatchStatus,
} from "../types/logistics";

const DISPATCHES_COLLECTION = "dispatches";

// Converter Timestamp para Date
const convertTimestampToDate = <T extends Record<string, any>>(data: T): T => {
  const converted: any = { ...data };

  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }

    if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item: any) => {
        if (typeof item === "object" && item !== null) {
          return convertTimestampToDate(item);
        }
        return item;
      });
    }
  });

  return converted;
};

export const logisticsService = {
  // ========== CREATE ==========
  async createDispatch(data: CreateDispatchData): Promise<Dispatch> {
    try {
      const dispatchRef = doc(collection(db, DISPATCHES_COLLECTION));
      const now = Timestamp.now();

      // Criar evento inicial
      const initialEvent: TrackingEvent = {
        id: `event-${Date.now()}`,
        status: "pending",
        description: "Despacho registrado no sistema",
        createdAt: now,
        createdBy: data.createdBy,
      };

      const newDispatch: Dispatch = {
        id: dispatchRef.id,
        ...data,
        status: "pending",
        priority: data.priority || "normal",
        dispatchDate: Timestamp.fromDate(data.dispatchDate),
        estimatedDeliveryDate: data.estimatedDeliveryDate
          ? Timestamp.fromDate(data.estimatedDeliveryDate)
          : undefined,
        trackingEvents: [initialEvent],
        documents: [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(dispatchRef, newDispatch);
      return convertTimestampToDate(newDispatch);
    } catch (error) {
      console.error("Erro ao criar despacho:", error);
      throw new Error("Não foi possível criar o despacho.");
    }
  },

  // ========== READ ==========
  async getDispatchById(id: string): Promise<Dispatch | null> {
    try {
      const dispatchRef = doc(db, DISPATCHES_COLLECTION, id);
      const dispatchSnap = await getDoc(dispatchRef);

      if (!dispatchSnap.exists()) {
        return null;
      }

      return convertTimestampToDate(dispatchSnap.data() as Dispatch);
    } catch (error) {
      console.error("Erro ao buscar despacho:", error);
      throw new Error("Não foi possível buscar o despacho.");
    }
  },

  async getAllDispatches(): Promise<Dispatch[]> {
    try {
      const dispatchesRef = collection(db, DISPATCHES_COLLECTION);
      const q = query(dispatchesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as Dispatch)
      );
    } catch (error) {
      console.error("Erro ao buscar despachos:", error);
      throw new Error("Não foi possível buscar os despachos.");
    }
  },

  async getFilteredDispatches(filters: DispatchFilters): Promise<Dispatch[]> {
    try {
      const allDispatches = await this.getAllDispatches();

      return allDispatches.filter((dispatch) => {
        if (filters.status && dispatch.status !== filters.status) return false;
        if (filters.priority && dispatch.priority !== filters.priority)
          return false;
        if (
          filters.transportType &&
          dispatch.transportType !== filters.transportType
        )
          return false;
        if (
          filters.technicianId &&
          dispatch.technicianId !== filters.technicianId
        )
          return false;
        if (filters.clientId && dispatch.clientId !== filters.clientId)
          return false;

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesClient = dispatch.clientName
            .toLowerCase()
            .includes(searchLower);
          const matchesTracking = dispatch.trackingCode
            ?.toLowerCase()
            .includes(searchLower);
          const matchesTechnician = dispatch.technicianName
            ?.toLowerCase()
            .includes(searchLower);

          if (!matchesClient && !matchesTracking && !matchesTechnician) {
            return false;
          }
        }

        if (filters.dateFrom) {
          const dispatchDate = dispatch.dispatchDate as Date;
          if (dispatchDate < filters.dateFrom) return false;
        }

        if (filters.dateTo) {
          const dispatchDate = dispatch.dispatchDate as Date;
          if (dispatchDate > filters.dateTo) return false;
        }

        return true;
      });
    } catch (error) {
      console.error("Erro ao filtrar despachos:", error);
      throw new Error("Não foi possível filtrar os despachos.");
    }
  },

  // ========== UPDATE ==========
  async updateDispatch(id: string, data: UpdateDispatchData): Promise<void> {
    try {
      const dispatchRef = doc(db, DISPATCHES_COLLECTION, id);
      const updates: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      if (data.estimatedDeliveryDate) {
        updates.estimatedDeliveryDate = Timestamp.fromDate(
          data.estimatedDeliveryDate
        );
      }

      if (data.actualDeliveryDate) {
        updates.actualDeliveryDate = Timestamp.fromDate(
          data.actualDeliveryDate
        );
      }

      await updateDoc(dispatchRef, updates);
    } catch (error) {
      console.error("Erro ao atualizar despacho:", error);
      throw new Error("Não foi possível atualizar o despacho.");
    }
  },

  async updateDispatchStatus(
    id: string,
    status: DispatchStatus,
    description: string,
    userId: string,
    location?: string
  ): Promise<void> {
    try {
      const dispatchRef = doc(db, DISPATCHES_COLLECTION, id);
      const dispatchSnap = await getDoc(dispatchRef);

      if (!dispatchSnap.exists()) {
        throw new Error("Despacho não encontrado");
      }

      const dispatch = dispatchSnap.data() as Dispatch;

      const newEvent: TrackingEvent = {
        id: `event-${Date.now()}`,
        status,
        description,
        location,
        createdAt: Timestamp.now(),
        createdBy: userId,
      };

      const updates: any = {
        status,
        trackingEvents: [...dispatch.trackingEvents, newEvent],
        updatedAt: Timestamp.now(),
      };

      if (location) {
        updates.currentLocation = location;
      }

      if (status === "delivered") {
        updates.actualDeliveryDate = Timestamp.now();
      }

      await updateDoc(dispatchRef, updates);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw new Error("Não foi possível atualizar o status.");
    }
  },

  async addDocument(
    dispatchId: string,
    document: Omit<DispatchDocument, "id" | "uploadedAt">
  ): Promise<void> {
    try {
      const dispatchRef = doc(db, DISPATCHES_COLLECTION, dispatchId);
      const dispatchSnap = await getDoc(dispatchRef);

      if (!dispatchSnap.exists()) {
        throw new Error("Despacho não encontrado");
      }

      const dispatch = dispatchSnap.data() as Dispatch;

      const newDocument: DispatchDocument = {
        ...document,
        id: `doc-${Date.now()}`,
        uploadedAt: Timestamp.now(),
      };

      await updateDoc(dispatchRef, {
        documents: [...dispatch.documents, newDocument],
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      throw new Error("Não foi possível adicionar o documento.");
    }
  },

  // ========== DELETE ==========
  async deleteDispatch(id: string): Promise<void> {
    try {
      const dispatchRef = doc(db, DISPATCHES_COLLECTION, id);
      await deleteDoc(dispatchRef);
    } catch (error) {
      console.error("Erro ao excluir despacho:", error);
      throw new Error("Não foi possível excluir o despacho.");
    }
  },

  // ========== STATISTICS ==========
  async getStats(): Promise<DispatchStats> {
    try {
      const dispatches = await this.getAllDispatches();

      const stats: DispatchStats = {
        total: dispatches.length,
        pending: dispatches.filter((d) => d.status === "pending").length,
        inTransit: dispatches.filter(
          (d) => d.status === "in_transit" || d.status === "out_for_delivery"
        ).length,
        delivered: dispatches.filter((d) => d.status === "delivered").length,
        failed: dispatches.filter((d) => d.status === "failed").length,
        avgDeliveryTime: 0,
        onTimeDeliveryRate: 0,
      };

      // Calcular tempo médio de entrega
      const deliveredWithDates = dispatches.filter(
        (d) =>
          d.status === "delivered" && d.actualDeliveryDate && d.dispatchDate
      );

      if (deliveredWithDates.length > 0) {
        const totalDays = deliveredWithDates.reduce((sum, d) => {
          const dispatch = d.dispatchDate as Date;
          const delivery = d.actualDeliveryDate as Date;
          const days = Math.ceil(
            (delivery.getTime() - dispatch.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0);

        stats.avgDeliveryTime = Math.round(
          totalDays / deliveredWithDates.length
        );
      }

      // Calcular taxa de entrega no prazo
      const deliveredWithEstimate = deliveredWithDates.filter(
        (d) => d.estimatedDeliveryDate
      );

      if (deliveredWithEstimate.length > 0) {
        const onTime = deliveredWithEstimate.filter((d) => {
          const delivery = d.actualDeliveryDate as Date;
          const estimate = d.estimatedDeliveryDate as Date;
          return delivery <= estimate;
        }).length;

        stats.onTimeDeliveryRate = Math.round(
          (onTime / deliveredWithEstimate.length) * 100
        );
      }

      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw new Error("Não foi possível buscar as estatísticas.");
    }
  },
};
