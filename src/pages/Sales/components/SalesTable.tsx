import type { Sale } from "../../../types/sales";
import {
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import "../../Clients/components/ClientsTable.css";

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  onView: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
}

export function SalesTable({
  sales,
  loading,
  onView,
  onDelete,
}: SalesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const getStatusBadge = (status: Sale["status"]) => {
    const config: Record<
      Sale["status"],
      { label: string; icon: typeof Clock; className: string }
    > = {
      pending: { label: "Pendente", icon: Clock, className: "status-pending" },
      in_progress: {
        label: "Em Andamento",
        icon: AlertCircle,
        className: "status-active",
      },
      stock_separated: {
        label: "Estoque OK",
        icon: CheckCircle2,
        className: "status-active",
      },
      dispatched: {
        label: "Despachado",
        icon: CheckCircle2,
        className: "status-active",
      },
      installing: {
        label: "Instalando",
        icon: Clock,
        className: "status-pending",
      },
      active: {
        label: "Ativo",
        icon: CheckCircle2,
        className: "status-active",
      },
      cancelled: {
        label: "Cancelado",
        icon: XCircle,
        className: "status-blocked",
      },
      suspended: {
        label: "Suspenso",
        icon: XCircle,
        className: "status-inactive",
      },
    };

    const cfg = config[status];
    const Icon = cfg.icon;

    return (
      <span className={`status-badge ${cfg.className}`}>
        <Icon size={14} />
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-loading">
          <div className="spinner-large"></div>
          <p>Carregando vendas...</p>
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <p>Nenhuma venda encontrada</p>
          <span>Crie uma nova venda para começar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>ID / Cliente</th>
              <th>Plano</th>
              <th>Valor Total</th>
              <th>Data da Venda</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>
                  <div className="client-info">
                    <div className="client-avatar">
                      {sale.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-details">
                      <p className="client-name">{sale.clientName}</p>
                      <p
                        className="client-location"
                        style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                      >
                        #{sale.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="plan-info">
                    <p className="plan-name">{sale.plan.name}</p>
                    <p className="plan-value">
                      {formatCurrency(sale.plan.value)}/mês
                    </p>
                  </div>
                </td>
                <td>
                  <span
                    className="document"
                    style={{ fontWeight: 600, color: "#059669" }}
                  >
                    {formatCurrency(sale.payment.totalValue)}
                  </span>
                </td>
                <td>
                  <span className="document">
                    {formatDate(sale.saleDate as Date)}
                  </span>
                </td>
                <td>{getStatusBadge(sale.status)}</td>
                <td>
                  <span
                    className={`status-badge ${
                      sale.payment.paymentStatus === "paid"
                        ? "status-active"
                        : sale.payment.paymentStatus === "overdue"
                        ? "status-blocked"
                        : "status-pending"
                    }`}
                  >
                    {sale.payment.paymentStatus === "paid"
                      ? "Pago"
                      : sale.payment.paymentStatus === "overdue"
                      ? "Atrasado"
                      : "Pendente"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => onView(sale)}
                      title="Ver Detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => onDelete(sale.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
