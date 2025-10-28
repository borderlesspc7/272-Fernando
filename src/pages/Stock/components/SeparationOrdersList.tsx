import type { SeparationOrder } from "../../../types/stock";
import { CheckCircle2, Package, XCircle, Play } from "lucide-react";
import "../../Clients/components/ClientsTable.css";

interface SeparationOrdersListProps {
  orders: SeparationOrder[];
  onUpdateStatus: (orderId: string, status: SeparationOrder["status"]) => void;
}

export function SeparationOrdersList({
  orders,
  onUpdateStatus,
}: SeparationOrdersListProps) {
  const getStatusBadge = (status: SeparationOrder["status"]) => {
    const config: Record<
      SeparationOrder["status"],
      { label: string; className: string }
    > = {
      pending: { label: "Pendente", className: "status-pending" },
      separating: { label: "Separando", className: "status-active" },
      ready: { label: "Pronto", className: "status-active" },
      dispatched: { label: "Despachado", className: "status-active" },
      cancelled: { label: "Cancelado", className: "status-blocked" },
    };

    const cfg = config[status];
    return <span className={`status-badge ${cfg.className}`}>{cfg.label}</span>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(date);
  };

  if (orders.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <CheckCircle2 size={48} />
          <p>Nenhuma ordem pendente</p>
          <span>Todas as vendas foram separadas</span>
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
              <th>Venda / Cliente</th>
              <th>Plano</th>
              <th>Equipamentos</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="client-info">
                    <div className="client-avatar">
                      <Package size={20} />
                    </div>
                    <div className="client-details">
                      <p className="client-name">{order.clientName}</p>
                      <p className="client-location">
                        ID: #{order.saleId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="document">{order.planName}</span>
                </td>
                <td>
                  <div>
                    {order.items.map((item, index) => (
                      <p
                        key={index}
                        style={{
                          margin: "0.25rem 0",
                          fontSize: "0.9rem",
                          color: item.separated ? "#059669" : "#64748b",
                        }}
                      >
                        {item.separated ? "✓" : "○"} {item.itemName} x
                        {item.quantity}
                      </p>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="document">
                    {formatDate(order.createdAt as Date)}
                  </span>
                </td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <div className="action-buttons">
                    {order.status === "pending" && (
                      <button
                        className="btn-action btn-edit"
                        onClick={() => onUpdateStatus(order.id, "separating")}
                        title="Iniciar Separação"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    {order.status === "separating" && (
                      <button
                        className="btn-action btn-view"
                        onClick={() => onUpdateStatus(order.id, "ready")}
                        title="Marcar como Pronto"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {order.status !== "cancelled" &&
                      order.status !== "dispatched" && (
                        <button
                          className="btn-action btn-delete"
                          onClick={() => onUpdateStatus(order.id, "cancelled")}
                          title="Cancelar"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
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
