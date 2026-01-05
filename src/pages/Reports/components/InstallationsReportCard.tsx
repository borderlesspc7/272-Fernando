import type { InstallationsReport } from "../../../types/reports";
import { Wrench, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import "./InstallationsReportCard.css";

interface Props {
  report: InstallationsReport;
}

export function InstallationsReportCard({ report }: Props) {
  return (
    <div className="report-card installations-report-card">
      <div className="report-card-header">
        <div className="report-card-title">
          <Wrench size={24} />
          <h3>Instalações</h3>
        </div>
      </div>

      <div className="report-card-content">
        <div className="report-summary">
          <div className="report-summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-value">{report.total}</span>
          </div>
          <div className="report-summary-item">
            <span className="summary-label">Taxa de Conclusão</span>
            <span className="summary-value summary-success">
              {report.completionRate}%
            </span>
          </div>
          <div className="report-summary-item">
            <span className="summary-label">Tempo Médio</span>
            <span className="summary-value">
              {report.avgCompletionTime} dias
            </span>
          </div>
        </div>

        <div className="report-section">
          <h4>Status</h4>
          <div className="report-stats-grid">
            <div className="report-stat-item stat-pending">
              <Clock size={20} />
              <span className="stat-label">Pendentes</span>
              <span className="stat-value">{report.pending}</span>
            </div>
            <div className="report-stat-item stat-in-progress">
              <TrendingUp size={20} />
              <span className="stat-label">Em Execução</span>
              <span className="stat-value">{report.inProgress}</span>
            </div>
            <div className="report-stat-item stat-completed">
              <CheckCircle2 size={20} />
              <span className="stat-label">Concluídas</span>
              <span className="stat-value">{report.completed}</span>
            </div>
          </div>
        </div>

        {report.byTechnician.length > 0 && (
          <div className="report-section">
            <h4>Por Técnico</h4>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Técnico</th>
                    <th>Total</th>
                    <th>Concluídas</th>
                    <th>Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byTechnician.map((tech) => {
                    const rate = Math.round(
                      (tech.completed / tech.total) * 100
                    );
                    return (
                      <tr key={tech.technicianId}>
                        <td>{tech.technicianName}</td>
                        <td>{tech.total}</td>
                        <td>{tech.completed}</td>
                        <td className="text-success">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
