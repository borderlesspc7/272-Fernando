import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { CreateSaleData, Equipment } from "../../../types/sales";
import { AVAILABLE_PLANS, EQUIPMENT_TEMPLATES } from "../../../types/sales";
import { salesService } from "../../../services/salesService";
import { clientService } from "../../../services/clientsService";
import type { Client } from "../../../types/clients";
import { X, Save, Loader2 } from "lucide-react";
import "./SaleModal.css";

interface SaleModalProps {
  onClose: () => void;
  onSuccess: () => void;
  createdBy: string;
}

export function SaleModal({ onClose, onSuccess, createdBy }: SaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [installationFee, setInstallationFee] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientService.getAllClients();
        setClients(data.filter((c) => c.status === "active"));
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };
    loadClients();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedClientId || !selectedPlanId) {
      setError("Selecione um cliente e um plano");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const client = clients.find((c) => c.id === selectedClientId);
      const plan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId);

      if (!client || !plan) return;

      const equipments: Equipment[] = (
        EQUIPMENT_TEMPLATES[selectedPlanId] || []
      ).map((eq, index) => ({
        ...eq,
        id: `eq-${Date.now()}-${index}`,
      }));

      const saleData: CreateSaleData = {
        clientId: client.id,
        clientName: client.name,
        plan,
        equipments,
        payment: {
          totalValue: plan.value + installationFee,
          installationFee,
          paymentStatus: "pending",
        },
        installationAddress: client.addresses[0],
        notes,
        createdBy,
      };

      await salesService.createSale(saleData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar venda");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId);

  return (
    <div className="sale-modal-overlay" onClick={onClose}>
      <div
        className="sale-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sale-modal-header">
          <h2>Nova Venda</h2>
          <button className="sale-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sale-modal-form">
          {error && (
            <div className="sale-form-error">
              <span>{error}</span>
            </div>
          )}

          <div className="sale-form-section">
            <h3>Selecionar Cliente</h3>
            <div className="sale-form-group">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Escolher Plano</h3>
            <div className="plan-cards-grid">
              {AVAILABLE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-card ${
                    selectedPlanId === plan.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setInstallationFee(plan.installationFee || 0);
                  }}
                >
                  <h4 className="plan-card-name">{plan.name}</h4>
                  <p className="plan-card-description">{plan.description}</p>
                  <p className="plan-card-price">
                    R$ {plan.value.toFixed(2)}/mês
                  </p>
                </div>
              ))}
            </div>
          </div>

          {selectedPlan && (
            <>
              <div className="sale-form-section">
                <h3>Taxa de Instalação</h3>
                <div className="sale-form-group">
                  <input
                    type="number"
                    value={installationFee}
                    onChange={(e) => setInstallationFee(Number(e.target.value))}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="sale-form-section">
                <h3>Equipamentos Inclusos</h3>
                <ul className="equipment-list">
                  {(EQUIPMENT_TEMPLATES[selectedPlanId] || []).map(
                    (eq, index) => (
                      <li key={index} className="equipment-item">
                        • {eq.name} ({eq.model}) - Qtd: {eq.quantity}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="sale-form-section">
                <h3>Observações</h3>
                <div className="sale-form-group">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações sobre a venda..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="sale-summary">
                <div className="summary-row">
                  <span>Plano Mensal:</span>
                  <strong>R$ {selectedPlan.value.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Taxa de Instalação:</span>
                  <strong>R$ {installationFee.toFixed(2)}</strong>
                </div>
                <div className="summary-total">
                  <span className="summary-total-label">Total Inicial:</span>
                  <span className="summary-total-value">
                    R$ {(selectedPlan.value + installationFee).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="sale-modal-footer">
            <button
              type="button"
              className="sale-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="sale-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="sale-spinner" />
                  Criando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Criar Venda
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
