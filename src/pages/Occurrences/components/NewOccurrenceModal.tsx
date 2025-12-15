import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { occurrencesService } from "../../../services/occurrencesService";
import { clientService } from "../../../services/clientsService";
import { salesService } from "../../../services/salesService";
import type {
  OccurrenceType,
  OccurrencePriority,
} from "../../../types/occurrences";
import type { Client } from "../../../types/clients";
import type { Sale } from "../../../types/sales";
import {
  OCCURRENCE_TYPE_LABELS,
  OCCURRENCE_PRIORITY_LABELS,
} from "../../../types/occurrences";
import "./NewOccurrenceModal.css";

interface NewOccurrenceModalProps {
  onClose: () => void;
  onCreate: () => void;
}

export default function NewOccurrenceModal({
  onClose,
  onCreate,
}: NewOccurrenceModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    saleId: "",
    type: "support" as OccurrenceType,
    priority: "medium" as OccurrencePriority,
    title: "",
    description: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      loadClientSales(formData.clientId);
    } else {
      setSales([]);
    }
  }, [formData.clientId]);

  const loadClients = async () => {
    try {
      const clientsData = await clientService.getAllClients();
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadClientSales = async (clientId: string) => {
    try {
      const allSales = await salesService.getAllSales();
      const clientSales = allSales.filter((sale) => sale.clientId === clientId);
      setSales(clientSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.title || !formData.description) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      const selectedClient = clients.find((c) => c.id === formData.clientId);

      await occurrencesService.createOccurrence({
        clientId: formData.clientId,
        clientName: selectedClient?.name || "Cliente",
        saleId: formData.saleId || undefined,
        type: formData.type,
        priority: formData.priority,
        status: "open",
        title: formData.title,
        description: formData.description,
      });

      onCreate();
    } catch (error) {
      console.error("Error creating occurrence:", error);
      alert("Erro ao criar ocorrência");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | OccurrenceType | OccurrencePriority
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="new-occurrence-overlay" onClick={onClose}>
      <div
        className="new-occurrence-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="new-occurrence-header">
          <h2>Nova Ocorrência</h2>
          <button className="new-occurrence-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="new-occurrence-form">
          <div className="new-occurrence-form-group">
            <label>
              Cliente <span className="new-occurrence-required">*</span>
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => handleChange("clientId", e.target.value)}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="new-occurrence-form-group">
            <label>Venda Relacionada (Opcional)</label>
            <select
              value={formData.saleId}
              onChange={(e) => handleChange("saleId", e.target.value)}
              disabled={!formData.clientId}
            >
              <option value="">Nenhuma venda selecionada</option>
              {sales.map((sale) => (
                <option key={sale.id} value={sale.id}>
                  {sale.plan.name} -{" "}
                  {new Date(sale.createdAt as Date).toLocaleDateString("pt-BR")}
                </option>
              ))}
            </select>
          </div>

          <div className="new-occurrence-form-row">
            <div className="new-occurrence-form-group">
              <label>
                Tipo <span className="new-occurrence-required">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  handleChange("type", e.target.value as OccurrenceType)
                }
                required
              >
                {(Object.keys(OCCURRENCE_TYPE_LABELS) as OccurrenceType[]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {OCCURRENCE_TYPE_LABELS[type]}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="new-occurrence-form-group">
              <label>
                Prioridade <span className="new-occurrence-required">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  handleChange("priority", e.target.value as OccurrencePriority)
                }
                required
              >
                {(
                  Object.keys(
                    OCCURRENCE_PRIORITY_LABELS
                  ) as OccurrencePriority[]
                ).map((priority) => (
                  <option key={priority} value={priority}>
                    {OCCURRENCE_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="new-occurrence-form-group">
            <label>
              Título <span className="new-occurrence-required">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Sem conexão à internet"
              required
            />
          </div>

          <div className="new-occurrence-form-group">
            <label>
              Descrição do Problema{" "}
              <span className="new-occurrence-required">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva o problema em detalhes..."
              rows={5}
              required
            />
          </div>

          <div className="new-occurrence-actions">
            <button
              type="button"
              className="new-occurrence-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="new-occurrence-submit"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Ocorrência"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
