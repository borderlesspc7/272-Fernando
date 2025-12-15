export type OccurrenceStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled';
export type OccurrencePriority = 'low' | 'medium' | 'high' | 'urgent';
export type OccurrenceType = 
  | 'connection' 
  | 'equipment' 
  | 'installation' 
  | 'billing' 
  | 'support' 
  | 'other';

export interface OccurrencePhoto {
  id: string;
  url: string;
  description?: string;
  uploadedAt: Date;
  type: 'before' | 'after' | 'general';
}

export interface OccurrenceCommunication {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface Occurrence {
  id: string;
  clientId: string;
  clientName: string;
  saleId?: string;
  type: OccurrenceType;
  priority: OccurrencePriority;
  status: OccurrenceStatus;
  title: string;
  description: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  photos: OccurrencePhoto[];
  communications: OccurrenceCommunication[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface OccurrenceFilters {
  status?: OccurrenceStatus[];
  priority?: OccurrencePriority[];
  type?: OccurrenceType[];
  clientId?: string;
  technicianId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface OccurrenceStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number; // in hours
  highPriority: number;
}

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em Atendimento',
  resolved: 'Resolvida',
  cancelled: 'Cancelada',
};

export const OCCURRENCE_PRIORITY_LABELS: Record<OccurrencePriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export const OCCURRENCE_TYPE_LABELS: Record<OccurrenceType, string> = {
  connection: 'Conexão',
  equipment: 'Equipamento',
  installation: 'Instalação',
  billing: 'Faturamento',
  support: 'Suporte',
  other: 'Outro',
};

