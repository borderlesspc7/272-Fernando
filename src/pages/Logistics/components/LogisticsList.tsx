import type { Dispatch } from "../../../types/logistics";
import {
  DISPATCH_STATUS_LABELS,
  DISPATCH_PRIORITY_LABELS,
  TRANSPORT_TYPE_LABELS,
} from "../../../types/logistics";
import { Eye, Package, MapPin } from "lucide-react";
import "./LogisticsList.css";

interface LogisticsListProps {
  dispatches: Dispatch[];
  onViewDetail: (dispatch: Dispatch) => void;
}

export function LogisticsList({
  dispatches,
  onViewDetail,
}: LogisticsListProps) {
  const getStatusBadge = (status: Dispatch["status"]) => {
    const config: Record<Dispatch["status"], { className: string }> = {
      pending: { className: "status-pending" },
      in_transit: { className: "status-active" },
      out_for_delivery: { className: "status-active" },
      delivered: { className: "status-active" },
      failed: { className: "status-blocked" },
      returned: { className: "status-blocked" },
    };

    const cfg = config[status];
    return (
      <span className={`logistics-status-badge ${cfg.className}`}>
        {DISPATCH_STATUS_LABELS[status]}
      </span>
    );
  };

  const getPriorityBadge = (priority: Dispatch["priority"]) => {
    const config: Record<Dispatch["priority"], { className: string }> = {
      low: { className: "status-active" },
      normal: { className: "status-pending" },
      high: { className: "status-pending" },
      urgent: { className: "status-blocked" },
    };

    const cfg = config[priority];
    return (
      <span className={`logistics-status-badge ${cfg.className}`}>
        {DISPATCH_PRIORITY_LABELS[priority]}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
    }).format(date);
  };

  if (dispatches.length === 0) {
    return (
      <div className="logistics-table-container">
        <div className="logistics-empty">
          <Package size={48} />
          <p>Nenhum despacho encontrado</p>
          <span>Não há despachos com os filtros selecionados</span>
        </div>
      </div>
    );
  }

  return (
    <div className="logistics-table-container">
      <div className="logistics-table-wrapper">
        <table className="logistics-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Destino</th>
              <th>Transporte</th>
              <th>Técnico</th>
              <th>Data Despacho</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((dispatch) => (
              <tr key={dispatch.id}>
                <td>
                  <div className="logistics-client-info">
                    <div className="logistics-avatar">
                      <Package size={20} />
                    </div>
                    <div className="logistics-details">
                      <p className="logistics-name">{dispatch.clientName}</p>
                      {dispatch.trackingCode && (
                        <p className="logistics-sub">
                          Cod: {dispatch.trackingCode}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="logistics-details">
                    <p className="logistics-name">
                      {dispatch.destination.split(",")[0]}
                    </p>
                    {dispatch.currentLocation && (
                      <p className="logistics-sub">
                        <MapPin size={12} /> {dispatch.currentLocation}
                      </p>
                    )}
                  </div>
                </td>
                <td>
                  <span className="logistics-document">
                    {TRANSPORT_TYPE_LABELS[dispatch.transportType]}
                  </span>
                </td>
                <td>
                  {dispatch.technicianName ? (
                    <div className="logistics-details">
                      <p className="logistics-name">
                        {dispatch.technicianName}
                      </p>
                      {dispatch.technicianPhone && (
                        <p className="logistics-sub">
                          {dispatch.technicianPhone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="logistics-document">-</span>
                  )}
                </td>
                <td>
                  <span className="logistics-document">
                    {formatDate(dispatch.dispatchDate as Date)}
                  </span>
                </td>
                <td>{getStatusBadge(dispatch.status)}</td>
                <td>{getPriorityBadge(dispatch.priority)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-view"
                      onClick={() => onViewDetail(dispatch)}
                      title="Ver Detalhes"
                    >
                      <Eye size={16} />
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
