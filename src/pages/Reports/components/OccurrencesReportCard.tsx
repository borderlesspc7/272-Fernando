import type { OccurrencesReport } from "../../../types/reports";
import { AlertCircle } from "lucide-react";
import { OCCURRENCE_TYPE_LABELS } from "../../../types/occurrences";
import { OCCURRENCE_STATUS_LABELS } from "../../../types/occurrences";
import "./OccurrencesReportCard.css";

interface Props {
  report: OccurrencesReport;
}

export function OccurrencesReportCard({ report }: Props) {
  return (
    <div className="report-card occurrences-report-card">
      <div className="report-card-header">
        <div className="report-card-title">
          <AlertCircle size={24} />
          <h3>Ocorrências</h3>
        </div>
      </div>

      <div className="report-card-content">
        <div className="report-summary">
          <div className="report-summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-value">{report.total}</span>
          </div>
          <div className="report-summary-item">
            <span className="summary-label">Tempo Médio de Resolução</span>
            <span className="summary-value">
              {report.avgResolutionTime} dias
            </span>
          </div>
        </div>

        <div className="report-section">
          <h4>Por Tipo de Problema</h4>
          <div className="report-list">
            {report.byType.map((item, idx) => (
              <div className="report-list-item" key={idx}>
                <span className="list-label">
                  {
                    OCCURRENCE_TYPE_LABELS[
                      item.type as keyof typeof OCCURRENCE_TYPE_LABELS
                    ]
                  }
                </span>
                <span className="list-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>Por Status</h4>
          <div className="report-stats-grid">
            {report.byStatus.map((item, idx) => (
              <div key={idx} className="report-stat-item">
                <span className="stat-label">
                  {
                    OCCURRENCE_STATUS_LABELS[
                      item.status as keyof typeof OCCURRENCE_STATUS_LABELS
                    ]
                  }
                </span>
                <span className="stat-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {report.resolutionByType.length > 0 && (
          <div className="report-section">
            <h4>Tempo de Resolução por Tipo</h4>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Tempo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {report.resolutionByType.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        {OCCURRENCE_TYPE_LABELS[
                          item.type as keyof typeof OCCURRENCE_TYPE_LABELS
                        ] || item.type}
                      </td>
                      <td className="text-time">{item.avgTime} dias</td>
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
