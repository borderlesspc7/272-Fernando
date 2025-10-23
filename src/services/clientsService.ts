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
  limit,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  Client,
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  PaginatedClients,
  ClientStats,
} from "../types/clients";

const CLIENTS_COLLECTION = "clients";

const convertTimestampToDate = (data: Client): Client => {
  return {
    ...data,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt,
    lastServiceDate:
      data.lastServiceDate instanceof Timestamp
        ? data.lastServiceDate.toDate()
        : data.lastServiceDate,
    currentPlan: data.currentPlan
      ? {
          ...data.currentPlan,
          contractedAt:
            data.currentPlan.contractedAt instanceof Timestamp
              ? data.currentPlan.contractedAt.toDate()
              : data.currentPlan.contractedAt,
        }
      : undefined,
  };
};

export const clientService = {
  // ========== CREATE ==========
  async createClient(data: CreateClientData): Promise<Client> {
    try {
      const clientRef = doc(collection(db, CLIENTS_COLLECTION));
      const now = Timestamp.now();

      const newClient: Client = {
        id: clientRef.id,
        ...data,
        status: data.status || "active",
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(clientRef, newClient);
      return convertTimestampToDate(newClient);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw new Error("Não foi possível criar o cliente. Tente novamente.");
    }
  },

  // ========== READ ==========
  async getClientById(clientId: string): Promise<Client | null> {
    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      const clientSnap = await getDoc(clientRef);

      if (!clientSnap.exists()) {
        return null;
      }

      return convertTimestampToDate(clientSnap.data() as Client);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      throw new Error("Não foi possível buscar o cliente. Tente novamente.");
    }
  },

  async getAllClients(): Promise<Client[]> {
    try {
      const clientsRef = collection(db, CLIENTS_COLLECTION);
      const q = query(clientsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as Client)
      );
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw new Error("Não foi possível buscar os clientes. Tente novamente.");
    }
  },

  async getClientsByFilters(filters: ClientFilters): Promise<Client[]> {
    try {
      const clientsRef = collection(db, CLIENTS_COLLECTION);
      const constraints: QueryConstraint[] = [];

      if (filters.status) {
        constraints.push(where("status", "==", filters.status));
      }

      if (filters.type) {
        constraints.push(where("type", "==", filters.type));
      }

      if (filters.hasActivePlan !== undefined) {
        if (filters.hasActivePlan) {
          constraints.push(where("currentPlan.status", "==", "active"));
        }
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(clientsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let clients = querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as Client)
      );

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        clients = clients.filter(
          (client) =>
            client.name.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower) ||
            client.phone.includes(searchLower) ||
            client.document.includes(searchLower)
        );
      }

      if (filters.city) {
        clients = clients.filter((client) =>
          client.addresses.some(
            (addr) => addr.city.toLowerCase() === filters.city?.toLowerCase()
          )
        );
      }

      if (filters.state) {
        clients = clients.filter((client) =>
          client.addresses.some(
            (addr) => addr.state.toLowerCase() === filters.state?.toLowerCase()
          )
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        clients = clients.filter((client) =>
          filters.tags?.some((tag) => client.tags?.includes(tag))
        );
      }

      if (filters.createdAfter) {
        clients = clients.filter((client) => {
          const clientDate =
            client.createdAt instanceof Date
              ? client.createdAt
              : client.createdAt instanceof Timestamp
              ? client.createdAt.toDate()
              : new Date();
          return clientDate >= filters.createdAfter!;
        });
      }

      if (filters.createdBefore) {
        clients = clients.filter((client) => {
          const clientDate =
            client.createdAt instanceof Date
              ? client.createdAt
              : client.createdAt instanceof Timestamp
              ? client.createdAt.toDate()
              : new Date();
          return clientDate <= filters.createdBefore!;
        });
      }

      return clients;
    } catch (error) {
      console.error("Erro ao buscar clientes com filtros:", error);
      throw new Error("Não foi possível buscar os clientes. Tente novamente.");
    }
  },

  async getClientsPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: ClientFilters
  ): Promise<PaginatedClients> {
    try {
      if (filters) {
        const allClients = await this.getClientsByFilters(filters);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedClients = allClients.slice(start, end);

        return {
          clients: paginatedClients,
          total: allClients.length,
          page,
          totalPages: Math.ceil(allClients.length / pageSize),
          hasNext: end < allClients.length,
          hasPrevious: page > 1,
        };
      }

      const clientsRef = collection(db, CLIENTS_COLLECTION);
      const q = query(
        clientsRef,
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(q);
      const clients = querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as Client)
      );

      const totalSnapshot = await getDocs(collection(db, CLIENTS_COLLECTION));
      const total = totalSnapshot.size;

      return {
        clients,
        total,
        page,
        totalPages: Math.ceil(total / pageSize),
        hasNext: clients.length === pageSize,
        hasPrevious: page > 1,
      };
    } catch (error) {
      console.error("Erro ao buscar clientes paginados:", error);
      throw new Error("Não foi possível buscar os clientes. Tente novamente.");
    }
  },

  async updateClient(
    clientId: string,
    data: UpdateClientData
  ): Promise<Client> {
    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      const clientSnap = await getDoc(clientRef);

      if (!clientSnap.exists()) {
        throw new Error("Cliente não encontrado");
      }

      const updatedData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(clientRef, updatedData);

      const updatedClientSnap = await getDoc(clientRef);
      return convertTimestampToDate(updatedClientSnap.data() as Client);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o cliente. Tente novamente."
      );
    }
  },

  async updateClientStatus(
    clientId: string,
    status: Client["status"]
  ): Promise<void> {
    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      await updateDoc(clientRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Erro ao atualizar status do cliente:", error);
      throw new Error(
        "Não foi possível atualizar o status do cliente. Tente novamente."
      );
    }
  },

  async deleteClient(clientId: string): Promise<void> {
    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      const clientSnap = await getDoc(clientRef);

      if (!clientSnap.exists()) {
        throw new Error("Cliente não encontrado");
      }

      await deleteDoc(clientRef);
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Não foi possível deletar o cliente. Tente novamente."
      );
    }
  },

  async getClientStats(): Promise<ClientStats> {
    try {
      const clients = await this.getAllClients();

      const stats: ClientStats = {
        total: clients.length,
        active: clients.filter((c) => c.status === "active").length,
        inactive: clients.filter((c) => c.status === "inactive").length,
        blocked: clients.filter((c) => c.status === "blocked").length,
        pending: clients.filter((c) => c.status === "pending").length,
        residential: clients.filter((c) => c.type === "residential").length,
        commercial: clients.filter((c) => c.type === "commercial").length,
        withActivePlan: clients.filter(
          (c) => c.currentPlan?.status === "active"
        ).length,
      };

      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw new Error(
        "Não foi possível buscar as estatísticas. Tente novamente."
      );
    }
  },

  async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      const allClients = await this.getAllClients();
      const searchLower = searchTerm.toLowerCase();

      return allClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.includes(searchLower) ||
          client.document.includes(searchLower) ||
          client.companyName?.toLowerCase().includes(searchLower) ||
          client.tradeName?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw new Error("Não foi possível buscar os clientes. Tente novamente.");
    }
  },

  validateDocument(document: string, type: "cpf" | "cnpj"): boolean {
    const cleanDoc = document.replace(/\D/g, "");

    if (type === "cpf") {
      return cleanDoc.length === 11;
    } else {
      return cleanDoc.length === 14;
    }
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },
};
