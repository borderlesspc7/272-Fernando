import type { SalesReport } from "../../../types/reports";
import { ShoppingCart } from "lucide-react";
import "./SalesReport.css";

interface Props {
  report: SalesReport;
}

export function SalesReportCard({ report }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(date);
  };

  return (
    <div className="report-card sales-report-card">
      <div className="report-card-header">
        <div className="report-card-title">
          <ShoppingCart size={24} />
          <h3>Vendas por Período</h3>
        </div>
      </div>

      <div className="report-card-content">
        <div className="report-summary">
          <div className="report-summary-item">
            <span className="summary-label">Total de Vendas</span>
            <span className="summary-value">{report.totalSales}</span>
          </div>
          <div className="report-summary-item">
            <span className="summary-label">Receita Total</span>
            <span className="summary-value">
              {formatCurrency(report.totalRevenue)}
            </span>
          </div>
        </div>

        <div className="report-section">
          <h4>Por Status</h4>
          <div className="report-stats-grid">
            <div className="report-stat-item">
              <span className="stat-label">Pendentes</span>
              <span className="stat-value">{report.byStatus.pending}</span>
            </div>
            <div className="report-stat-item">
              <span className="stat-label">Em Andamento</span>
              <span className="stat-value">{report.byStatus.inProgress}</span>
            </div>
            <div className="report-stat-item">
              <span className="stat-label">Concluídas</span>
              <span className="stat-value">{report.byStatus.active}</span>
            </div>
            <div className="report-stat-item">
              <span className="stat-label">Canceladas</span>
              <span className="stat-value">{report.byStatus.cancelled}</span>
            </div>
          </div>
        </div>

        {report.byMonth.length > 0 && (
          <div className="report-section">
            <h4>Por Mês</h4>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Vendas</th>
                    <th>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byMonth.map((month, idx) => (
                    <tr key={idx}>
                      <td>{month.month}</td>
                      <td>{month.sales}</td>
                      <td>{formatCurrency(month.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="report-period">
          <span>
            Período: {formatDate(report.period.from)} até{" "}
            {formatDate(report.period.to)}
          </span>
        </div>
      </div>
    </div>
  );
}
