import { salesService } from "./salesService";
import { installationsService } from "./installationsService";
import { occurrencesService } from "./occurrencesService";
import { stockService } from "./stockService";
import type {
  SalesReport,
  InstallationsReport,
  OccurrencesReport,
  StockReport,
  ReportFilters,
} from "../types/reports";
import type { Timestamp } from "firebase/firestore";

export const reportsService = {
  async getSalesReport(filters?: ReportFilters): Promise<SalesReport> {
    try {
      const allSales = await salesService.getAllSales();

      let filteredSales = allSales;

      if (filters?.dateFrom || filters?.dateTo) {
        filteredSales = allSales.filter((sale) => {
          const saleDate =
            sale.saleDate instanceof Date
              ? sale.saleDate
              : (sale.saleDate as Timestamp).toDate();

          if (filters.dateFrom && saleDate < filters.dateFrom) return false;
          if (filters.dateTo && saleDate > filters.dateTo) return false;
          return true;
        });
      }

      const byMonth = new Map<string, { sales: number; revenue: number }>();

      filteredSales.forEach((sale) => {
        const saleDate =
          sale.saleDate instanceof Date
            ? sale.saleDate
            : (sale.saleDate as Timestamp).toDate();
        const monthKey = `${saleDate.getFullYear()}-${String(
          saleDate.getMonth() + 1
        ).padStart(2, "0")}`;

        const existing = byMonth.get(monthKey) || { sales: 0, revenue: 0 };
        byMonth.set(monthKey, {
          sales: existing.sales + 1,
          revenue: existing.revenue + sale.payment.totalValue,
        });
      });

      const byMonthArray = Array.from(byMonth.entries()).map(([key, data]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString("pt-BR", {
            month: "short",
            year: "numeric",
          }),
          sales: data.sales,
          revenue: data.revenue,
        };
      });

      return {
        period: {
          from: filters?.dateFrom || new Date(0),
          to: filters?.dateTo || new Date(),
        },
        totalSales: filteredSales.length,
        totalRevenue: filteredSales.reduce(
          (sum, sale) => sum + sale.payment.totalValue,
          0
        ),
        byStatus: {
          pending: filteredSales.filter((s) => s.status === "pending").length,
          inProgress: filteredSales.filter(
            (s) =>
              s.status === "in_progress" ||
              s.status === "stock_separated" ||
              s.status === "dispatched" ||
              s.status === "installing"
          ).length,
          active: filteredSales.filter((s) => s.status === "active").length,
          cancelled: filteredSales.filter((s) => s.status === "cancelled")
            .length,
        },
        byMonth: byMonthArray,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de vendas:", error);
      throw error;
    }
  },

  async getInstallationsReport(
    filters?: ReportFilters
  ): Promise<InstallationsReport> {
    try {
      const allInstallations = await installationsService.getAllInstallations();

      let filtered = allInstallations;

      if (filters?.technicianId) {
        filtered = filtered.filter(
          (inst) => inst.technicianId === filters.technicianId
        );
      }

      const completed = filtered.filter((i) => i.status === "completed");

      const completionTimes: number[] = [];
      completed.forEach((inst) => {
        if (inst.startedAt && inst.completedAt) {
          const started =
            inst.startedAt instanceof Date
              ? inst.startedAt
              : (inst.startedAt as Timestamp).toDate();
          const completed =
            inst.completedAt instanceof Date
              ? inst.completedAt
              : (inst.completedAt as Timestamp).toDate();
          const days = Math.ceil(
            (completed.getTime() - started.getTime()) / (1000 * 60 * 60 * 24)
          );
          completionTimes.push(days);
        }
      });

      const byTechnicianMap = new Map<
        string,
        { name: string; total: number; completed: number }
      >();

      filtered.forEach((inst) => {
        if (inst.technicianId && inst.technicianName) {
          const existing = byTechnicianMap.get(inst.technicianId) || {
            name: inst.technicianName,
            total: 0,
            completed: 0,
          };
          existing.total++;
          if (inst.status === "completed") existing.completed++;
          byTechnicianMap.set(inst.technicianId, existing);
        }
      });

      return {
        total: filtered.length,
        pending: filtered.filter((i) => i.status === "pending").length,
        inProgress: filtered.filter((i) => i.status === "in_progress").length,
        completed: completed.length,
        completionRate:
          filtered.length > 0
            ? Math.round((completed.length / filtered.length) * 100)
            : 0,
        avgCompletionTime:
          completionTimes.length > 0
            ? Math.round(
                completionTimes.reduce((a, b) => a + b, 0) /
                  completionTimes.length
              )
            : 0,
        byTechnician: Array.from(byTechnicianMap.entries()).map(
          ([id, data]) => ({
            technicianId: id,
            technicianName: data.name,
            total: data.total,
            completed: data.completed,
          })
        ),
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de instalações:", error);
      throw error;
    }
  },

  async getOccurrencesReport(
    filters?: ReportFilters
  ): Promise<OccurrencesReport> {
    try {
      const allOccurrences = await occurrencesService.getAllOccurrences();

      let filtered = allOccurrences;

      if (filters?.dateFrom || filters?.dateTo) {
        filtered = filtered.filter((occ) => {
          const created =
            occ.createdAt instanceof Date
              ? occ.createdAt
              : (occ.createdAt as Timestamp).toDate();

          if (filters.dateFrom && created < filters.dateFrom) return false;
          if (filters.dateTo && created > filters.dateTo) return false;
          return true;
        });
      }

      const byTypeMap = new Map<string, number>();
      const byStatusMap = new Map<string, number>();
      const resolutionTimesByType = new Map<string, number[]>();

      filtered.forEach((occ) => {
        // Por tipo
        const typeCount = byTypeMap.get(occ.type) || 0;
        byTypeMap.set(occ.type, typeCount + 1);

        // Por status
        const statusCount = byStatusMap.get(occ.status) || 0;
        byStatusMap.set(occ.status, statusCount + 1);

        // Tempo de resolução por tipo
        if (occ.status === "resolved" && occ.updatedAt) {
          const created =
            occ.createdAt instanceof Date
              ? occ.createdAt
              : (occ.createdAt as Timestamp).toDate();
          const updated =
            occ.updatedAt instanceof Date
              ? occ.updatedAt
              : (occ.updatedAt as Timestamp).toDate();
          const days = Math.ceil(
            (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          );

          const times = resolutionTimesByType.get(occ.type) || [];
          times.push(days);
          resolutionTimesByType.set(occ.type, times);
        }
      });

      const resolved = filtered.filter((o) => o.status === "resolved");
      const allResolutionTimes: number[] = [];
      resolved.forEach((occ) => {
        if (occ.updatedAt) {
          const created =
            occ.createdAt instanceof Date
              ? occ.createdAt
              : (occ.createdAt as Timestamp).toDate();
          const updated =
            occ.updatedAt instanceof Date
              ? occ.updatedAt
              : (occ.updatedAt as Timestamp).toDate();
          const days = Math.ceil(
            (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          );
          allResolutionTimes.push(days);
        }
      });

      const avgResolutionTime =
        allResolutionTimes.length > 0
          ? Math.round(
              allResolutionTimes.reduce((a, b) => a + b, 0) /
                allResolutionTimes.length
            )
          : 0;

      const resolutionByType = Array.from(resolutionTimesByType.entries()).map(
        ([type, times]) => ({
          type,
          avgTime:
            times.length > 0
              ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
              : 0,
        })
      );

      return {
        total: filtered.length,
        byType: Array.from(byTypeMap.entries()).map(([type, count]) => ({
          type,
          count,
        })),
        byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({
          status,
          count,
        })),
        avgResolutionTime,
        resolutionByType,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de ocorrências:", error);
      throw error;
    }
  },

  async getStockReport(): Promise<StockReport> {
    try {
      const stats = await stockService.getStats();
      const items = await stockService.getAllItems();

      const byStatusMap = new Map<string, { count: number; value: number }>();
      const byCategoryMap = new Map<string, { count: number; value: number }>();

      items.forEach((item) => {
        const itemValue = (item.unitPrice || 0) * item.quantity;

        // Por status
        const statusData = byStatusMap.get(item.status) || {
          count: 0,
          value: 0,
        };
        statusData.count += item.quantity;
        statusData.value += itemValue;
        byStatusMap.set(item.status, statusData);

        // Por categoria
        const categoryData = byCategoryMap.get(item.category) || {
          count: 0,
          value: 0,
        };
        categoryData.count += item.quantity;
        categoryData.value += itemValue;
        byCategoryMap.set(item.category, categoryData);
      });

      const inFieldItems = items
        .filter(
          (item) => item.status === "dispatched" || item.status === "available"
        )
        .reduce((sum, item) => sum + item.quantity, 0);

      return {
        totalItems: stats.totalItems,
        totalValue: stats.totalValue,
        byStatus: Array.from(byStatusMap.entries()).map(([status, data]) => ({
          status,
          count: data.count,
          value: data.value,
        })),
        byCategory: Array.from(byCategoryMap.entries()).map(
          ([category, data]) => ({
            category,
            count: data.count,
            value: data.value,
          })
        ),
        lowStockItems: stats.lowStockItems,
        inFieldItems,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de estoque:", error);
      throw error;
    }
  },
};
