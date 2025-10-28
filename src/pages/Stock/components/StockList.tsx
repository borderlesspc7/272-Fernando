import type { StockItem } from "../../../types/stock";
import { Edit2, Trash2, Package, AlertTriangle, Eye } from "lucide-react";
import { CATEGORY_LABELS, STOCK_STATUS_LABELS } from "../../../types/stock";
import "../../Clients/components/ClientsTable.css";

interface StockListProps {
  items: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (itemId: string) => void;
  onViewDetail: (item: StockItem) => void;
}

export function StockList({
  items,
  onEdit,
  onDelete,
  onViewDetail,
}: StockListProps) {
  const getStatusBadge = (status: StockItem["status"]) => {
    const config: Record<StockItem["status"], { className: string }> = {
      available: { className: "status-active" },
      reserved: { className: "status-pending" },
      separated: { className: "status-active" },
      dispatched: { className: "status-active" },
      in_maintenance: { className: "status-inactive" },
      defective: { className: "status-blocked" },
    };

    const cfg = config[status];

    return (
      <span className={`status-badge ${cfg.className}`}>
        {STOCK_STATUS_LABELS[status]}
      </span>
    );
  };

  if (items.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <Package size={48} />
          <p>Nenhum item no estoque</p>
          <span>Adicione itens para começar</span>
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
              <th>Item / Modelo</th>
              <th>Categoria</th>
              <th>Localização</th>
              <th>Quantidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLowStock = item.quantity <= item.minimumStock;

              return (
                <tr key={item.id}>
                  <td>
                    <div className="client-info">
                      <div className="client-avatar">
                        <Package size={20} />
                      </div>
                      <div className="client-details">
                        <p className="client-name">{item.name}</p>
                        <p className="client-location">{item.model}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="document">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                  </td>
                  <td>
                    <div>
                      <p className="client-name">{item.location.warehouse}</p>
                      {item.location.shelf && (
                        <p className="client-location">
                          {item.location.shelf}
                          {item.location.position &&
                            ` - ${item.location.position}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="client-name">
                        {item.quantity} un.
                        {isLowStock && (
                          <AlertTriangle
                            size={16}
                            style={{ marginLeft: "0.5rem", color: "#f59e0b" }}
                          />
                        )}
                      </p>
                      <p className="client-location">
                        Mín: {item.minimumStock}
                        {item.reservedQuantity > 0 &&
                          ` | Reservado: ${item.reservedQuantity}`}
                      </p>
                    </div>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => onViewDetail(item)}
                        title="Ver Detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => onEdit(item)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => onDelete(item.id)}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
