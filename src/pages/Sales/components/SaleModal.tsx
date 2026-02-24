import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
  CreateSaleData,
  Equipment,
  ContractType,
} from "../../../types/sales";
import {
  AVAILABLE_PLANS,
  CONTRACT_TYPE_LABELS,
  OFFER_CATEGORY_LABELS,
} from "../../../types/sales";
import { salesService } from "../../../services/salesService";
import { clientService } from "../../../services/clientsService";
import { stockService } from "../../../services/stockService";
import type { Client } from "../../../types/clients";
import type { StockItem } from "../../../types/stock";
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
  const [contractType, setContractType] = useState<ContractType>("simplified_adhesion");
  const [installationFee, setInstallationFee] = useState(0);
  const [notes, setNotes] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, stockData] = await Promise.all([
          clientService.getAllClients(),
          stockService.getAllItems(),
        ]);

        setClients(clientsData.filter((c) => c.status === "active"));
        setStockItems(
          stockData.filter(
            (item) => item.status === "available" && item.quantity > 0
          )
        );
      } catch (error) {
        console.error("Erro ao carregar dados para venda:", error);
      }
    };

    loadData();
  }, []);

  const toggleEquipment = (itemId: string) => {
    setSelectedEquipments((prev) => {
      if (prev[itemId]) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: 1 };
    });
  };

  const updateEquipmentQuantity = (itemId: string, quantity: number) => {
    if (Number.isNaN(quantity) || quantity <= 0) quantity = 1;
    setSelectedEquipments((prev) => ({
      ...prev,
      [itemId]: quantity,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedClientId || !selectedPlanId) {
      setError("Selecione um cliente e um plano");
      return;
    }

    if (Object.keys(selectedEquipments).length === 0) {
      setError("Selecione pelo menos um equipamento do estoque");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const client = clients.find((c) => c.id === selectedClientId);
      const plan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId);

      if (!client || !plan) return;

      const equipments: Equipment[] = Object.entries(selectedEquipments).map(
        ([itemId, quantity]) => {
          const item = stockItems.find((i) => i.id === itemId);
          if (!item) {
            throw new Error("Item de estoque não encontrado");
          }

          return {
            id: item.id,
            name: item.name,
            model: item.model,
            type: (item.category as unknown) as Equipment["type"],
            quantity,
            status: "pending",
          };
        }
      );

      const saleData: CreateSaleData = {
        clientId: client.id,
        clientName: client.name,
        plan,
        contractType,
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
            <h3>Escolher Plano (Categoria de Oferta)</h3>
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
                  {plan.category && (
                    <span
                      className={`plan-category plan-category-${plan.category}`}
                    >
                      {OFFER_CATEGORY_LABELS[plan.category]}
                    </span>
                  )}
                  <h4 className="plan-card-name">{plan.name}</h4>
                  <p className="plan-card-description">{plan.description}</p>
                  <p className="plan-card-price">
                    R$ {plan.value.toFixed(2)}/mês
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Forma de Contratação</h3>
            <div className="sale-form-group">
              <select
                value={contractType}
                onChange={(e) =>
                  setContractType(e.target.value as ContractType)
                }
                required
              >
                <option value="simplified_adhesion">
                  {CONTRACT_TYPE_LABELS.simplified_adhesion}
                </option>
                <option value="monthly_advance">
                  {CONTRACT_TYPE_LABELS.monthly_advance}
                </option>
                <option value="equipment_sale">
                  {CONTRACT_TYPE_LABELS.equipment_sale}
                </option>
              </select>
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
                <h3>Equipamentos do Estoque</h3>
                <div className="equipment-list">
                  {stockItems.length === 0 ? (
                    <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Nenhum item de estoque disponível. Cadastre itens na tela
                      de Estoque antes de criar a venda.
                    </p>
                  ) : (
                    stockItems.map((item) => {
                      const qty = selectedEquipments[item.id] || 0;
                      const checked = qty > 0;
                      return (
                        <div key={item.id} className="equipment-item">
                          <div className="equipment-info">
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleEquipment(item.id)}
                              />
                              <span className="equipment-name">
                                {item.name}
                              </span>
                            </label>
                            <span className="equipment-details">
                              Modelo: {item.model} | Em estoque:{" "}
                              {item.quantity}
                            </span>
                            {checked && (
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#64748b",
                                  }}
                                >
                                  Qtd para esta venda:
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.quantity}
                                  value={qty || 1}
                                  onChange={(e) =>
                                    updateEquipmentQuantity(
                                      item.id,
                                      Number(e.target.value)
                                    )
                                  }
                                  style={{
                                    width: "80px",
                                    padding: "0.25rem 0.5rem",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
