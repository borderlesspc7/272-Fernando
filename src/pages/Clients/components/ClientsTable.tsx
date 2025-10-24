import type { Client } from "../../../types/clients";
import { Edit2, Trash2, Phone, Mail, MapPin, CheckCircle2, XCircle, Clock, Ban } from "lucide-react";
import "./ClientsTable.css";

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export function ClientsTable({ clients, loading, onEdit, onDelete }: ClientsTableProps) {
  const getStatusBadge = (status: Client["status"]) => {
    const statusConfig = {
      active: { label: "Ativo", icon: CheckCircle2, className: "status-active" },
      inactive: { label: "Inativo", icon: XCircle, className: "status-inactive" },
      pending: { label: "Pendente", icon: Clock, className: "status-pending" },
      blocked: { label: "Bloqueado", icon: Ban, className: "status-blocked" },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: Client["type"]) => {
    return (
      <span className={`type-badge type-${type}`}>
        {type === "residential" ? "Residencial" : "Comercial"}
      </span>
    );
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatDocument = (document: string, type: "cpf" | "cnpj") => {
    const cleaned = document.replace(/\D/g, "");
    if (type === "cpf" && cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    } else if (type === "cnpj" && cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return document;
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-loading">
          <div className="spinner-large"></div>
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <p>Nenhum cliente encontrado</p>
          <span>Tente ajustar os filtros ou adicione um novo cliente</span>
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
              <th>Cliente</th>
              <th>Contato</th>
              <th>Documento</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Plano</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>
                  <div className="client-info">
                    <div className="client-avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-details">
                      <p className="client-name">{client.name}</p>
                      {client.addresses[0] && (
                        <p className="client-location">
                          <MapPin size={12} />
                          {client.addresses[0].city}, {client.addresses[0].state}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <p className="contact-item">
                      <Phone size={14} />
                      {formatPhone(client.phone)}
                    </p>
                    <p className="contact-item">
                      <Mail size={14} />
                      {client.email}
                    </p>
                  </div>
                </td>
                <td>
                  <span className="document">
                    {formatDocument(client.document, client.documentType)}
                  </span>
                </td>
                <td>{getTypeBadge(client.type)}</td>
                <td>{getStatusBadge(client.status)}</td>
                <td>
                  {client.currentPlan ? (
                    <div className="plan-info">
                      <p className="plan-name">{client.currentPlan.name}</p>
                      <p className="plan-value">
                        R$ {client.currentPlan.value.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <span className="no-plan">Sem plano</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => onEdit(client)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => onDelete(client.id)}
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

