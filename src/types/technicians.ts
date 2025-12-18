export type TechnicianStatus = "active" | "inactive";
export type TechnicianRegion =
  | "norte"
  | "sul"
  | "leste"
  | "oeste"
  | "centro"
  | "metropolitana";

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  region: TechnicianRegion;
  status: TechnicianStatus;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTechnicianData {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  region: TechnicianRegion;
  status?: TechnicianStatus;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
}

export interface UpdateTechnicianData {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  region?: TechnicianRegion;
  status?: TechnicianStatus;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
}

export interface TechnicianFilters {
  status?: TechnicianStatus;
  region?: TechnicianRegion;
  search?: string;
}

export const TECHNICIAN_STATUS_LABELS: Record<TechnicianStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export const TECHNICIAN_REGION_LABELS: Record<TechnicianRegion, string> = {
  norte: "Norte",
  sul: "Sul",
  leste: "Leste",
  oeste: "Oeste",
  centro: "Centro",
  metropolitana: "Metropolitana",
};
