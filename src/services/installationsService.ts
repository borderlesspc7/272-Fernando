import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Installation,
  CreateInstallationData,
  UpdateInstallationData,
  InstallationFilters,
  InstallationPhoto,
} from "../types/installations";

const COLLECTION = "installations";

// Mock para visualização rápida
const getMockInstallations = (): Installation[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  return [
    {
      id: "inst-001",
      saleId: "sale-001",
      clientId: "client-001",
      clientName: "João Silva",
      clientPhone: "(11) 98765-4321",
      clientAddress: "Rua das Flores, 123, Centro, São Paulo - SP",
      technicianId: "tech-001",
      technicianName: "Carlos Oliveira",
      technicianPhone: "(11) 91234-5678",
      status: "in_progress",
      scheduledDate: twoDaysAgo,
      startedAt: yesterday,
      equipments: [
        {
          itemId: "item-001",
          itemName: "Roteador Wi-Fi",
          model: "TP-Link Archer C6",
          serialNumber: "SN123456789",
          quantity: 1,
        },
        {
          itemId: "item-002",
          itemName: "Antena Externa",
          model: "Antena 15dBi",
          serialNumber: "SN987654321",
          quantity: 1,
        },
      ],
      photos: [],
      notes: "Cliente pede instalação em horário comercial",
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      createdBy: "user-001",
    },
    {
      id: "inst-002",
      saleId: "sale-002",
      clientId: "client-002",
      clientName: "Maria Santos",
      clientPhone: "(11) 97654-3210",
      clientAddress: "Av. Paulista, 1000, São Paulo - SP",
      technicianId: "tech-002",
      technicianName: "Ana Paula",
      technicianPhone: "(11) 92345-6789",
      status: "pending",
      scheduledDate: now,
      equipments: [
        {
          itemId: "item-003",
          itemName: "Roteador Wi-Fi",
          model: "TP-Link Archer AX50",
          serialNumber: "SN456789123",
          quantity: 1,
        },
      ],
      photos: [],
      notes: "Instalação urgente",
      createdAt: now,
      updatedAt: now,
      createdBy: "user-001",
    },
    {
      id: "inst-003",
      saleId: "sale-003",
      clientId: "client-003",
      clientName: "Pedro Costa",
      clientPhone: "(11) 96543-2109",
      clientAddress: "Rua Augusta, 500, São Paulo - SP",
      technicianId: "tech-001",
      technicianName: "Carlos Oliveira",
      technicianPhone: "(11) 91234-5678",
      status: "completed",
      scheduledDate: twoDaysAgo,
      startedAt: twoDaysAgo,
      completedAt: yesterday,
      equipments: [
        {
          itemId: "item-004",
          itemName: "Roteador Wi-Fi",
          model: "TP-Link Archer C7",
          serialNumber: "SN789123456",
          quantity: 1,
        },
        {
          itemId: "item-005",
          itemName: "Cabo de Rede",
          model: "Cabo Cat6 50m",
          quantity: 2,
        },
      ],
      photos: [
        {
          id: "photo-1",
          url: "https://storage.example.com/installations/inst-003/foto1.jpg",
          description: "Roteador instalado",
          uploadedAt: yesterday,
          uploadedBy: "tech-001",
        },
      ],
      notes: "Instalação concluída com sucesso",
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      createdBy: "user-001",
    },
  ];
};

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

export const installationsService = {
  async createInstallation(
    data: CreateInstallationData
  ): Promise<Installation> {
    const ref = doc(collection(db, COLLECTION));
    const now = Timestamp.now();
    const newInstallation: Installation = {
      id: ref.id,
      ...data,
      status: "pending",
      scheduledDate: Timestamp.fromDate(data.scheduledDate),
      startedAt: undefined,
      completedAt: undefined,
      photos: [],
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(ref, newInstallation);
    return convertTimestampToDate(newInstallation);
  },

  async getInstallationById(id: string): Promise<Installation | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return convertTimestampToDate(snap.data() as Installation);
  },

  async getAllInstallations(): Promise<Installation[]> {
    try {
      const ref = collection(db, COLLECTION);
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) =>
        convertTimestampToDate(d.data() as Installation)
      );
      if (data.length === 0) return getMockInstallations();
      return data;
    } catch (err) {
      console.error("Erro ao buscar instalações:", err);
      return getMockInstallations(); // fallback para visualização
    }
  },

  async getInstallationsByFilters(
    filters: InstallationFilters
  ): Promise<Installation[]> {
    const all = await this.getAllInstallations();
    return all.filter((inst) => {
      if (filters.status && inst.status !== filters.status) return false;
      if (filters.technicianId && inst.technicianId !== filters.technicianId)
        return false;
      if (filters.clientId && inst.clientId !== filters.clientId) return false;

      if (filters.search) {
        const term = filters.search.toLowerCase();
        const hits =
          inst.clientName.toLowerCase().includes(term) ||
          inst.technicianName?.toLowerCase().includes(term);
        if (!hits) return false;
      }

      if (filters.dateFrom) {
        const sched = inst.scheduledDate as Date;
        if (sched < filters.dateFrom) return false;
      }

      if (filters.dateTo) {
        const sched = inst.scheduledDate as Date;
        if (sched > filters.dateTo) return false;
      }

      return true;
    });
  },

  async updateInstallation(
    id: string,
    data: UpdateInstallationData
  ): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    const updates: any = { ...data, updatedAt: Timestamp.now() };
    if (data.scheduledDate) {
      updates.scheduledDate = Timestamp.fromDate(data.scheduledDate);
    }
    if (data.startedAt) {
      updates.startedAt = Timestamp.fromDate(data.startedAt);
    }
    if (data.completedAt) {
      updates.completedAt = Timestamp.fromDate(data.completedAt);
    }
    await updateDoc(ref, updates);
  },

  async markAsCompleted(id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, {
      status: "completed",
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async addPhoto(
    installationId: string,
    photo: Omit<InstallationPhoto, "id" | "uploadedAt">
  ): Promise<void> {
    const ref = doc(db, COLLECTION, installationId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Instalação não encontrada");

    const installation = snap.data() as Installation;
    const newPhoto: InstallationPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
      uploadedAt: Timestamp.now(),
    };

    await updateDoc(ref, {
      photos: [...installation.photos, newPhoto],
      updatedAt: Timestamp.now(),
    });
  },

  async getStats() {
    try {
      const installations = await this.getAllInstallations();
      return {
        total: installations.length,
        pending: installations.filter((i) => i.status === "pending").length,
        inProgress: installations.filter((i) => i.status === "in_progress").length,
        completed: installations.filter((i) => i.status === "completed").length,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas de instalações:", error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
      };
    }
  },
};
