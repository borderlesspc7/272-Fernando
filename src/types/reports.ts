export interface SalesReport {
  period: {
    from: Date;
    to: Date;
  };
  totalSales: number;
  totalRevenue: number;
  byStatus: {
    pending: number;
    inProgress: number;
    active: number;
    cancelled: number;
  };
  byMonth: {
    month: string;
    sales: number;
    revenue: number;
  }[];
}

export interface InstallationsReport {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
  avgCompletionTime: number; // em dias
  byTechnician: {
    technicianId: string;
    technicianName: string;
    total: number;
    completed: number;
  }[];
}

export interface OccurrencesReport {
  total: number;
  byType: {
    type: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
  avgResolutionTime: number; // em dias
  resolutionByType: {
    type: string;
    avgTime: number;
  }[];
}

export interface StockReport {
  totalItems: number;
  totalValue: number;
  byStatus: {
    status: string;
    count: number;
    value: number;
  }[];
  byCategory: {
    category: string;
    count: number;
    value: number;
  }[];
  lowStockItems: number;
  inFieldItems: number;
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  technicianId?: string;
  clientId?: string;
}
