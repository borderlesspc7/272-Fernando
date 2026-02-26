import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
  CreateSaleData,
  Equipment,
  ContractType,
} from "../../../types/sales";
import { CONTRACT_TYPE_LABELS, type Plan } from "../../../types/sales";
import { salesService } from "../../../services/salesService";
import { clientService } from "../../../services/clientsService";
import { stockService } from "../../../services/stockService";
import { techniciansService } from "../../../services/techniciansService";
import type { Client } from "../../../types/clients";
import type { StockItem } from "../../../types/stock";
import type { Technician } from "../../../types/technicians";
import { X, Save, Loader2 } from "lucide-react";
import "./SaleModal.css";
import { useAuth } from "../../../hooks/useAuth";

interface SaleModalProps {
  onClose: () => void;
  onSuccess: () => void;
  createdBy: string;
}

export function SaleModal({ onClose, onSuccess, createdBy }: SaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [contractType, setContractType] = useState<ContractType>("simplified_adhesion");
  const [installationFee, setInstallationFee] = useState(0);
  const [monthlyValue, setMonthlyValue] = useState(0);
  const [notes, setNotes] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Record<string, number>>({});
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [installationDate, setInstallationDate] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, stockData, techniciansData] = await Promise.all([
          clientService.getAllClients(),
          stockService.getAllItems(),
          techniciansService.getAllTechnicians(),
        ]);

        // Para venda, exibimos todos os clientes que não estão bloqueados
        setClients(
          clientsData.filter((c) => c.status !== "blocked")
        );
        setStockItems(
          stockData.filter(
            (item) => item.status === "available" && item.quantity > 0
          )
        );
        setTechnicians(techniciansData.filter((t) => t.status === "active"));
      } catch (error) {
        console.error("Erro ao carregar dados para venda:", error);
      }
    };

    loadData();
  }, []);

  // Valores podem ser definidos livremente, sem depender de planos cadastrados

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

    if (!selectedClientId) {
      setError("Selecione um cliente");
      return;
    }

    if (!installationDate) {
      setError("Defina a data de instalação");
      return;
    }

    if (!selectedTechnicianId) {
      setError("Selecione o técnico responsável");
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
      const technician = technicians.find(
        (t) => t.id === selectedTechnicianId
      );

      if (!client || !technician) return;

      // Criamos um \"plano\" genérico apenas para preencher o tipo da venda.
      const plan: Plan = {
        id: "custom-plan",
        name: "Serviço personalizado",
        value: monthlyValue,
        installationFee,
      };

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
        clientPhone: client.phone,
        plan,
        contractType,
        equipments,
        payment: {
          totalValue: monthlyValue + installationFee,
          installationFee,
          paymentStatus: "pending",
        },
        installationAddress: client.addresses[0],
        estimatedInstallationDate: new Date(installationDate),
        technicianId: technician.id,
        technicianName: technician.name,
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
            <h3>Definir Técnico e Data de Instalação</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Técnico Responsável</label>
                <select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  required
                >
                  <option value="">Selecione um técnico...</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} - {tech.region.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sale-form-group">
                <label>Data de Instalação</label>
                <input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Removida a escolha de plano: valores são definidos manualmente */}

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

          <div className="sale-form-section">
                <h3>Valores e Descontos</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="sale-form-group">
                    <label>Mensalidade (valor do serviço)</label>
                    <input
                      type="number"
                      value={monthlyValue}
                      min={0}
                      step="0.01"
                      onChange={(e) => setMonthlyValue(Number(e.target.value))}
                    />
                  </div>

                  <div className="sale-form-group">
                    <label>Taxa de Instalação</label>
                    <input
                      type="number"
                      value={installationFee}
                      onChange={(e) =>
                        setInstallationFee(Number(e.target.value))
                      }
                      step="0.01"
                      min="0"
                    />
                  </div>
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
                  <strong>R$ {monthlyValue.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Taxa de Instalação:</span>
                  <strong>R$ {installationFee.toFixed(2)}</strong>
                </div>
                <div className="summary-total">
                  <span className="summary-total-label">Total Inicial:</span>
                  <span className="summary-total-value">
                    R$ {(monthlyValue + installationFee).toFixed(2)}
                  </span>
                </div>
              </div>

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
