import { AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import type { OccurrenceStats } from '../../../types/occurrences';
import './OccurrencesStats.css';

interface OccurrencesStatsProps {
  stats: OccurrenceStats;
}

export default function OccurrencesStats({ stats }: OccurrencesStatsProps) {
  return (
    <div className="occurrences-stats">
      <div className="occurrences-stat-card">
        <div className="occurrences-stat-icon occurrences-stat-open">
          <AlertCircle size={24} />
        </div>
        <div className="occurrences-stat-content">
          <div className="occurrences-stat-value">{stats.open}</div>
          <div className="occurrences-stat-label">Abertas</div>
        </div>
      </div>

      <div className="occurrences-stat-card">
        <div className="occurrences-stat-icon occurrences-stat-progress">
          <Clock size={24} />
        </div>
        <div className="occurrences-stat-content">
          <div className="occurrences-stat-value">{stats.inProgress}</div>
          <div className="occurrences-stat-label">Em Atendimento</div>
        </div>
      </div>

      <div className="occurrences-stat-card">
        <div className="occurrences-stat-icon occurrences-stat-resolved">
          <CheckCircle size={24} />
        </div>
        <div className="occurrences-stat-content">
          <div className="occurrences-stat-value">{stats.resolved}</div>
          <div className="occurrences-stat-label">Resolvidas</div>
        </div>
      </div>

      <div className="occurrences-stat-card">
        <div className="occurrences-stat-icon occurrences-stat-priority">
          <TrendingUp size={24} />
        </div>
        <div className="occurrences-stat-content">
          <div className="occurrences-stat-value">
            {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime}h` : '-'}
          </div>
          <div className="occurrences-stat-label">Tempo Médio</div>
        </div>
      </div>
    </div>
  );
}

