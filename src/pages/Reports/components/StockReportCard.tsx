import type { StockReport } from "../../../types/reports";
import { Package, AlertTriangle } from "lucide-react";
import "./StockReportCard.css";

interface Props {
  report: StockReport;
}

export function StockReportCard({ report }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="report-card stock-report-card">
      <div className="report-card-header">
        <div className="report-card-title">
          <Package size={24} />
          <h3>Estoque e Equipamentos</h3>
        </div>
      </div>

      <div className="report-card-content">
        <div className="report-summary">
          <div className="report-summary-item">
            <span className="summary-label">Total de Itens</span>
            <span className="summary-value">{report.totalItems}</span>
          </div>
          <div className="report-summary-item">
            <span className="summary-label">Valor Total</span>
            <span className="summary-value summary-revenue">
              {formatCurrency(report.totalValue)}
            </span>
          </div>
          <div className="report-summary-item">
            <span className="summary-label">Em Campo</span>
            <span className="summary-value">{report.inFieldItems}</span>
          </div>
          <div className="report-summary-item summary-warning">
            <AlertTriangle size={20} />
            <span className="summary-label">Estoque Baixo</span>
            <span className="summary-value">{report.lowStockItems}</span>
          </div>
        </div>

        <div className="report-section">
          <h4>Por Status</h4>
          <div className="report-table">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {report.byStatus.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.status}</td>
                    <td>{item.count}</td>
                    <td className="text-revenue">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {report.byCategory.length > 0 && (
          <div className="report-section">
            <h4>Por Categoria</h4>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byCategory.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.category}</td>
                      <td>{item.count}</td>
                      <td className="text-revenue">
                        {formatCurrency(item.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
