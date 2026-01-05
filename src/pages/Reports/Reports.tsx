import { useState, useEffect } from "react";
import { reportsService } from "../../services/reportsService";
import type {
  InstallationsReport,
  OccurrencesReport,
  ReportFilters,
  SalesReport,
  StockReport,
} from "../../types/reports";
import { ReportsFilters } from "./components/ReportsFilters";
import { SalesReportCard } from "./components/SalesReport";
import { InstallationsReportCard } from "./components/InstallationsReportCard";
import { OccurrencesReportCard } from "./components/OccurrencesReportCard";
import { StockReportCard } from "./components/StockReportCard";
import { BarChart3 } from "lucide-react";
import "./Reports.css";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [installationsReport, setInstallationsReport] =
    useState<InstallationsReport | null>(null);
  const [ocurrencesReport, setOccurrencesReport] =
    useState<OccurrencesReport | null>(null);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [sales, installations, occurrences, stock] = await Promise.all([
        reportsService.getSalesReport(filters),
        reportsService.getInstallationsReport(filters),
        reportsService.getOccurrencesReport(filters),
        reportsService.getStockReport(),
      ]);
      setSalesReport(sales);
      setInstallationsReport(installations);
      setOccurrencesReport(occurrences);
      setStockReport(stock);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="spinner-large"></div>
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="header-content">
          <div className="header-title">
            <BarChart3 size={32} />
            <h1>Relatórios</h1>
          </div>
          <p className="page-description">Visão analítica da operação</p>
        </div>
      </div>

      <ReportsFilters onFilterChange={handleFilterChange} />

      <div className="reports-grid">
        {salesReport && <SalesReportCard report={salesReport} />}
        {installationsReport && (
          <InstallationsReportCard report={installationsReport} />
        )}
        {ocurrencesReport && (
          <OccurrencesReportCard report={ocurrencesReport} />
        )}
        {stockReport && <StockReportCard report={stockReport} />}
      </div>
    </div>
  );
}
