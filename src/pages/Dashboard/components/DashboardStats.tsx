import { ShoppingCart, Wrench, AlertCircle, Package } from 'lucide-react';
import './DashboardStats.css';

interface DashboardStatsProps {
  stats: {
    sales: {
      inProgress: number;
      completed: number;
    };
    installations: {
      pending: number;
    };
    occurrences: {
      open: number;
    };
    stock: {
      totalItems: number;
    };
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="dashboard-stats">
      <div className="dashboard-stat-card dashboard-stat-sales">
        <div className="dashboard-stat-icon">
          <ShoppingCart size={28} />
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-label">Vendas</div>
          <div className="dashboard-stat-values">
            <div className="dashboard-stat-value">
              <span className="dashboard-stat-number">{stats.sales.inProgress}</span>
              <span className="dashboard-stat-sublabel">Em Andamento</span>
            </div>
            <div className="dashboard-stat-divider"></div>
            <div className="dashboard-stat-value">
              <span className="dashboard-stat-number">{stats.sales.completed}</span>
              <span className="dashboard-stat-sublabel">Concluídas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stat-card dashboard-stat-installations">
        <div className="dashboard-stat-icon">
          <Wrench size={28} />
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-label">Instalações</div>
          <div className="dashboard-stat-main-value">
            <span className="dashboard-stat-number">{stats.installations.pending}</span>
            <span className="dashboard-stat-sublabel">Pendentes</span>
          </div>
        </div>
      </div>

      <div className="dashboard-stat-card dashboard-stat-occurrences">
        <div className="dashboard-stat-icon">
          <AlertCircle size={28} />
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-label">Ocorrências</div>
          <div className="dashboard-stat-main-value">
            <span className="dashboard-stat-number">{stats.occurrences.open}</span>
            <span className="dashboard-stat-sublabel">Abertas</span>
          </div>
        </div>
      </div>

      <div className="dashboard-stat-card dashboard-stat-stock">
        <div className="dashboard-stat-icon">
          <Package size={28} />
        </div>
        <div className="dashboard-stat-content">
          <div className="dashboard-stat-label">Estoque</div>
          <div className="dashboard-stat-main-value">
            <span className="dashboard-stat-number">{stats.stock.totalItems}</span>
            <span className="dashboard-stat-sublabel">Equipamentos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

