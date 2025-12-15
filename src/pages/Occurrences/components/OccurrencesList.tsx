import { Eye } from 'lucide-react';
import type { Occurrence } from '../../../types/occurrences';
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_PRIORITY_LABELS, OCCURRENCE_TYPE_LABELS } from '../../../types/occurrences';
import './OccurrencesList.css';

interface OccurrencesListProps {
  occurrences: Occurrence[];
  onViewDetails: (occurrence: Occurrence) => void;
}

export default function OccurrencesList({ occurrences, onViewDetails }: OccurrencesListProps) {
  const getStatusBadgeClass = (status: Occurrence['status']): string => {
    const baseClass = 'occurrences-badge';
    switch (status) {
      case 'open':
        return `${baseClass} occurrences-badge-warning`;
      case 'in_progress':
        return `${baseClass} occurrences-badge-info`;
      case 'resolved':
        return `${baseClass} occurrences-badge-success`;
      case 'cancelled':
        return `${baseClass} occurrences-badge-default`;
      default:
        return baseClass;
    }
  };

  const getPriorityBadgeClass = (priority: Occurrence['priority']): string => {
    const baseClass = 'occurrences-badge';
    switch (priority) {
      case 'urgent':
        return `${baseClass} occurrences-badge-danger`;
      case 'high':
        return `${baseClass} occurrences-badge-warning`;
      case 'medium':
        return `${baseClass} occurrences-badge-info`;
      case 'low':
        return `${baseClass} occurrences-badge-default`;
      default:
        return baseClass;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (occurrences.length === 0) {
    return (
      <div className="occurrences-empty">
        <p>Nenhuma ocorrência encontrada</p>
      </div>
    );
  }

  return (
    <div className="occurrences-list-container">
      <table className="occurrences-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Técnico</th>
            <th>Data Abertura</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {occurrences.map((occurrence) => (
            <tr key={occurrence.id}>
              <td className="occurrences-id">#{occurrence.id.slice(-6).toUpperCase()}</td>
              <td className="occurrences-client">{occurrence.clientName}</td>
              <td className="occurrences-title">{occurrence.title}</td>
              <td>
                <span className="occurrences-type">{OCCURRENCE_TYPE_LABELS[occurrence.type]}</span>
              </td>
              <td>
                <span className={getPriorityBadgeClass(occurrence.priority)}>
                  {OCCURRENCE_PRIORITY_LABELS[occurrence.priority]}
                </span>
              </td>
              <td>
                <span className={getStatusBadgeClass(occurrence.status)}>
                  {OCCURRENCE_STATUS_LABELS[occurrence.status]}
                </span>
              </td>
              <td className="occurrences-technician">
                {occurrence.assignedTechnicianName || <span className="occurrences-sub">Não atribuído</span>}
              </td>
              <td className="occurrences-date">{formatDate(occurrence.createdAt)}</td>
              <td>
                <button
                  className="occurrences-action-btn"
                  onClick={() => onViewDetails(occurrence)}
                  title="Ver detalhes"
                >
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

