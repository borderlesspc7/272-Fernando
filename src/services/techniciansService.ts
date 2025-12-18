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
import type {
  Technician,
  CreateTechnicianData,
  UpdateTechnicianData,
  TechnicianFilters,
} from "../types/technicians";

const COLLECTION = "technicians";

// Mock para visualização rápida
const getMockTechnicians = (): Technician[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return [
    {
      id: "tech-001",
      name: "Carlos Oliveira",
      email: "carlos.oliveira@empresa.com",
      phone: "(11) 91234-5678",
      cpf: "123.456.789-00",
      region: "norte",
      status: "active",
      address: {
        street: "Rua das Flores, 123",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
      },
      notes: "Especialista em instalações residenciais",
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "tech-002",
      name: "Ana Paula Silva",
      email: "ana.silva@empresa.com",
      phone: "(11) 92345-6789",
      cpf: "987.654.321-00",
      region: "sul",
      status: "active",
      address: {
        street: "Av. Paulista, 1000",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
      },
      notes: "Experiência em manutenções",
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "tech-003",
      name: "Roberto Santos",
      email: "roberto.santos@empresa.com",
      phone: "(11) 93456-7890",
      cpf: "456.789.123-00",
      region: "leste",
      status: "inactive",
      address: {
        street: "Rua Augusta, 500",
        city: "São Paulo",
        state: "SP",
        zipCode: "01305-000",
      },
      createdAt: yesterday,
      updatedAt: yesterday,
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
    await setDoc(ref, newTechnician);
    return convertTimestampToDate(newTechnician);
  },

  async getTechnicianById(id: string): Promise<Technician | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return convertTimestampToDate(snap.data() as Technician);
  },

  async getAllTechnicians(): Promise<Technician[]> {
    try {
      const ref = collection(db, COLLECTION);
      const q = query(ref, orderBy("name", "asc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) =>
        convertTimestampToDate(d.data() as Technician)
      );
      if (data.length === 0) return getMockTechnicians();
      return data;
    } catch (err) {
      console.error("Erro ao buscar técnicos:", err);
      return getMockTechnicians(); // fallback para visualização
    }
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
    await updateDoc(ref, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteTechnician(id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
  },
};
