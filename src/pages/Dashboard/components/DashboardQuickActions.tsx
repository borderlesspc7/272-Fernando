import { ShoppingCart, Users, AlertCircle } from 'lucide-react';
import './DashboardQuickActions.css';

interface DashboardQuickActionsProps {
  onNewSale: () => void;
  onNewClient: () => void;
  onNewOccurrence: () => void;
}

export default function DashboardQuickActions({
  onNewSale,
  onNewClient,
  onNewOccurrence,
}: DashboardQuickActionsProps) {
  return (
    <div className="dashboard-quick-actions">
      <h2 className="dashboard-quick-actions-title">Acesso Rápido</h2>
      <div className="dashboard-quick-actions-grid">
        <button className="dashboard-quick-action-btn dashboard-quick-action-sale" onClick={onNewSale}>
          <div className="dashboard-quick-action-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="dashboard-quick-action-content">
            <span className="dashboard-quick-action-label">Nova Venda</span>
            <span className="dashboard-quick-action-description">Criar nova venda/contrato</span>
          </div>
        </button>

        <button className="dashboard-quick-action-btn dashboard-quick-action-client" onClick={onNewClient}>
          <div className="dashboard-quick-action-icon">
            <Users size={24} />
          </div>
          <div className="dashboard-quick-action-content">
            <span className="dashboard-quick-action-label">Novo Cliente</span>
            <span className="dashboard-quick-action-description">Cadastrar novo cliente</span>
          </div>
        </button>

        <button className="dashboard-quick-action-btn dashboard-quick-action-occurrence" onClick={onNewOccurrence}>
          <div className="dashboard-quick-action-icon">
            <AlertCircle size={24} />
          </div>
          <div className="dashboard-quick-action-content">
            <span className="dashboard-quick-action-label">Nova Ocorrência</span>
            <span className="dashboard-quick-action-description">Registrar problema/manutenção</span>
          </div>
        </button>
      </div>
    </div>
  );
}

