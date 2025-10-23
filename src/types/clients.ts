import { Timestamp } from "firebase/firestore";

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isMainAddress: boolean;
}

export interface Contact {
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
}

export type ClientStatus = "active" | "inactive" | "blocked" | "pending";

export type ClientType = "residential" | "commercial";

export interface Plan {
  id: string;
  name: string;
  value: number;
  contractedAt: Date | Timestamp;
  status: "active" | "cancelled" | "suspended";
}

export interface Client {
  id: string;

  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  document: string;
  documentType: "cpf" | "cnpj";

  type: ClientType;
  status: ClientStatus;

  addresses: Address[];

  contacts?: Contact[];

  currentPlan?: Plan;

  notes?: string;
  observations?: string;

  companyName?: string;
  tradeName?: string;
  stateRegistration?: string;

  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  lastServiceDate?: Date | Timestamp;

  createdBy: string;

  tags?: string[];
}

export interface CreateClientData {
  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  document: string;
  documentType: "cpf" | "cnpj";
  type: ClientType;
  status?: ClientStatus;
  addresses: Address[];
  contacts?: Contact[];
  currentPlan?: Plan;
  notes?: string;
  observations?: string;
  companyName?: string;
  tradeName?: string;
  stateRegistration?: string;
  createdBy: string;
  tags?: string[];
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  document?: string;
  documentType?: "cpf" | "cnpj";
  type?: ClientType;
  status?: ClientStatus;
  addresses?: Address[];
  contacts?: Contact[];
  currentPlan?: Plan;
  notes?: string;
  observations?: string;
  companyName?: string;
  tradeName?: string;
  stateRegistration?: string;
  tags?: string[];
}

export interface ClientFilters {
  status?: ClientStatus;
  type?: ClientType;
  city?: string;
  state?: string;
  hasActivePlan?: boolean;
  search?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface PaginatedClients {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  pending: number;
  residential: number;
  commercial: number;
  withActivePlan: number;
}
