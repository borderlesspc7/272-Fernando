import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { prepareForFirestore } from "../utils/firebaseHelpers";
import type {
  Technician,
  CreateTechnicianData,
  UpdateTechnicianData,
  TechnicianFilters,
} from "../types/technicians";

const COLLECTION = "technicians";

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

    if (
      typeof converted[key] === "object" &&
      converted[key] !== null &&
      key === "address"
    ) {
      converted[key] = convertTimestampToDate(converted[key]);
    }
  });

  return converted;
};

export const techniciansService = {
  async createTechnician(data: CreateTechnicianData): Promise<Technician> {
    const ref = doc(collection(db, COLLECTION));
    const now = Timestamp.now();
    const newTechnician: Technician = {
      id: ref.id,
      ...data,
      status: data.status || "active",
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };

    const cleaned = prepareForFirestore(newTechnician);
    await setDoc(ref, cleaned);

    return convertTimestampToDate(newTechnician);
  },

  async getTechnicianById(id: string): Promise<Technician | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return convertTimestampToDate(snap.data() as Technician);
  },

  async getAllTechnicians(): Promise<Technician[]> {
    const ref = collection(db, COLLECTION);
    const q = query(ref, orderBy("name", "asc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) =>
      convertTimestampToDate(d.data() as Technician)
    );
    return data;
  },

  async getTechniciansByFilters(
    filters: TechnicianFilters
  ): Promise<Technician[]> {
    const all = await this.getAllTechnicians();
    return all.filter((tech) => {
      if (filters.status && tech.status !== filters.status) return false;
      if (filters.region && tech.region !== filters.region) return false;

      if (filters.search) {
        const term = filters.search.toLowerCase();
        const hits =
          tech.name.toLowerCase().includes(term) ||
          tech.email.toLowerCase().includes(term) ||
          tech.phone.includes(term);
        if (!hits) return false;
      }

      return true;
    });
  },

  async updateTechnician(
    id: string,
    data: UpdateTechnicianData
  ): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    const updates = {
      ...data,
      updatedAt: Timestamp.now().toDate(),
    };
    const cleaned = prepareForFirestore(updates);
    await updateDoc(ref, cleaned);
  },

  async deleteTechnician(id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
  },
};
