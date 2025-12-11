import type { Installation } from "../../../types/installations";
import { INSTALLATION_STATUS_LABELS } from "../../../types/installations";
import { Eye, Wrench, User, Calendar } from "lucide-react";
import "./InstallationsList.css";

interface Props {
  installations: Installation[];
  onViewDetail: (installation: Installation) => void;
}

export function InstallationsList({ installations, onViewDetail }: Props) {
  const badgeClass = (status: Installation["status"]) => {
    const map: Record<Installation["status"], string> = {
      pending: "status-pending",
      in_progress: "status-active",
      completed: "status-done",
    };
    return map[status];
  };

  const fmtDate = (date: Date | undefined) =>
    date
      ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date)
      : "-";

  if (installations.length === 0) {
    return (
      <div className="installations-table-container">
        <div className="installations-empty">
          <Wrench size={48} />
          <p>Nenhuma instalação encontrada</p>
          <span>Use filtros ou cadastre em uma nova instalação</span>
        </div>
      </div>
    );
  }

  return (
    <div className="installations-table-container">
      <div className="installations-table-wrapper">
        <table className="installations-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Técnico</th>
              <th>Data agendada</th>
              <th>Status</th>
              <th>Equipamentos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {installations.map((inst) => (
              <tr key={inst.id}>
                <td>
                  <div className="installations-client">
                    <User size={20} />
                    <div className="installations-details">
                      <p className="installations-name">{inst.clientName}</p>
                      <p className="installations-sub">{inst.clientAddress}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {inst.technicianName ? (
                    <div className="installations-details">
                      <p className="installations-name">
                        {inst.technicianName}
                      </p>
                      <p className="installations-sub">
                        {inst.technicianPhone}
                      </p>
                    </div>
                  ) : (
                    <span className="installations-sub">-</span>
                  )}
                </td>
                <td>
                  <div className="installations-date">
                    <Calendar size={16} />
                    <span>{fmtDate(inst.scheduledDate as Date)}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`installations-badge ${badgeClass(inst.status)}`}
                  >
                    {INSTALLATION_STATUS_LABELS[inst.status]}
                  </span>
                </td>
                <td>
                  <span className="installations-equip">
                    {inst.equipments.reduce((sum, eq) => sum + eq.quantity, 0)}{" "}
                    itens
                  </span>
                </td>
                <td>
                  <div className="installations-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => onViewDetail(inst)}
                      title="Ver detalhes"
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
