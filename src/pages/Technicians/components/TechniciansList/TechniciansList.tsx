import type { Technician } from "../../../../types/technicians";
import {
  TECHNICIAN_STATUS_LABELS,
  TECHNICIAN_REGION_LABELS,
} from "../../../../types/technicians";
import { Edit, User, MapPin, Phone, Mail } from "lucide-react";
import "./TechniciansList.css";

interface Props {
  technicians: Technician[];
  onEdit: (technician: Technician) => void;
}

export function TechniciansList({ technicians, onEdit }: Props) {
  const getStatusBadge = (status: Technician["status"]) => {
    return (
      <span className={`technician-badge technician-status-${status}`}>
        {TECHNICIAN_STATUS_LABELS[status]}
      </span>
    );
  };

  if (technicians.length === 0) {
    return (
      <div className="technicians-table-container">
        <div className="technicians-empty">
          <User size={48} />
          <p>Nenhum técnico encontrado</p>
          <span>Use os filtros ou cadastre um novo técnico</span>
        </div>
      </div>
    );
  }

  return (
    <div className="technicians-table-container">
      <div className="technicians-table-wrapper">
        <table className="technicians-table">
          <thead>
            <tr>
              <th>Técnico</th>
              <th>Contato</th>
              <th>Região</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech) => (
              <tr key={tech.id}>
                <td>
                  <div className="technician-info">
                    <User size={20} />
                    <div className="technician-details">
                      <p className="technician-name">{tech.name}</p>
                      {tech.cpf && (
                        <p className="technician-cpf">CPF: {tech.cpf}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="technician-contact">
                    <div className="technician-contact-item">
                      <Mail size={14} />
                      <span>{tech.email}</span>
                    </div>
                    <div className="technician-contact-item">
                      <Phone size={14} />
                      <span>{tech.phone}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="technician-region">
                    <MapPin size={16} />
                    <span>{TECHNICIAN_REGION_LABELS[tech.region]}</span>
                  </div>
                </td>
                <td>{getStatusBadge(tech.status)}</td>
                <td>
                  <div className="technician-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => onEdit(tech)}
                      title="Editar"
                    >
                      <Edit size={16} />
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
