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
import { prepareForFirestore } from "../utils/firebaseHelpers";
import type {
  Installation,
  CreateInstallationData,
  UpdateInstallationData,
  InstallationFilters,
  InstallationPhoto,
} from "../types/installations";

const COLLECTION = "installations";

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
      photos: [],
      createdAt: now,
      updatedAt: now,
    };

    // Remove campos undefined antes de salvar
    const cleaned = prepareForFirestore(newInstallation);

    await setDoc(ref, cleaned);
    return convertTimestampToDate(newInstallation);
  },

  async getInstallationById(id: string): Promise<Installation | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return convertTimestampToDate(snap.data() as Installation);
  },

  async getAllInstallations(): Promise<Installation[]> {
    const ref = collection(db, COLLECTION);
    const q = query(ref, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      convertTimestampToDate(d.data() as Installation)
    );
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

    const cleaned = prepareForFirestore(updates);

    await updateDoc(ref, cleaned);
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
