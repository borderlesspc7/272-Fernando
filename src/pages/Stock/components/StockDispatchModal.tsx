import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { StockItem, SeparationOrder } from "../../../types/stock";
import { stockService } from "../../../services/stockService";
import { salesService } from "../../../services/salesService";
import { X, Save, Loader2, Plus, Trash2, Package } from "lucide-react";
import "../../Sales/components/SaleModal.css";

interface DispatchItem {
  itemId: string;
  quantity: number;
}

interface StockDispatchModalProps {
  onClose: () => void;
  onSuccess: () => void;
  createdBy: string;
}

export function StockDispatchModal({
  onClose,
  onSuccess,
  createdBy,
}: StockDispatchModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [separationOrders, setSeparationOrders] = useState<SeparationOrder[]>(
    []
  );
  const [selectedOrderId, setSelectedOrderId] = useState("");

  const [formData, setFormData] = useState({
    destination: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    technician: "",
    technicianContact: "",
    trackingCode: "",
    estimatedDelivery: "",
    notes: "",
  });

  const [dispatchItems, setDispatchItems] = useState<DispatchItem[]>([
    { itemId: "", quantity: 0 },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, ordersData] = await Promise.all([
          stockService.getAllItems(),
          stockService.getSeparationOrders(),
        ]);
        setItems(itemsData.filter((item) => item.status === "available"));
        setSeparationOrders(ordersData.filter((o) => o.status === "ready"));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = separationOrders.find((o) => o.id === orderId);
    if (order) {
      setDispatchItems(
        order.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        }))
      );
      setFormData({
        ...formData,
        destination: `Cliente: ${order.clientName}`,
      });
    }
  };

  const addItem = () => {
    setDispatchItems([...dispatchItems, { itemId: "", quantity: 0 }]);
  };

  const removeItem = (index: number) => {
    setDispatchItems(dispatchItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DispatchItem, value: any) => {
    const updated = [...dispatchItems];
    updated[index] = { ...updated[index], [field]: value };
    setDispatchItems(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.destination) {
      setError("Informe o destino");
      return;
    }

    const validItems = dispatchItems.filter(
      (item) => item.itemId && item.quantity > 0
    );

    if (validItems.length === 0) {
      setError("Adicione pelo menos um item");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await stockService.createDispatch({
        items: validItems,
        destination: formData.destination,
        dispatchDate: new Date(formData.dispatchDate),
        technician: formData.technician || undefined,
        technicianContact: formData.technicianContact || undefined,
        trackingCode: formData.trackingCode || undefined,
        estimatedDelivery: formData.estimatedDelivery
          ? new Date(formData.estimatedDelivery)
          : undefined,
        notes: formData.notes || undefined,
        createdBy,
      });

      // Se foi vinculado a uma ordem, atualizar status
      if (selectedOrderId) {
        const order = separationOrders.find((o) => o.id === selectedOrderId);
        await stockService.updateSeparationOrderStatus(
          selectedOrderId,
          "dispatched",
          createdBy
        );

        // Atualizar status da venda
        if (order) {
          await salesService.updateSaleStatus(
            order.saleId,
            "in_stock",
            "Equipamentos despachados para instalação"
          );
        }
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar despacho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sale-modal-overlay" onClick={onClose}>
      <div
        className="sale-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px" }}
      >
        <div className="sale-modal-header">
          <h2>Despacho de Equipamentos</h2>
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

          {separationOrders.length > 0 && (
            <div className="sale-form-section">
              <h3>Vincular a Ordem de Separação (Opcional)</h3>
              <div className="sale-form-group">
                <label>Ordem Pronta para Despacho</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                >
                  <option value="">Despacho avulso (sem ordem)</option>
                  {separationOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.clientName} - {order.planName} (
                      {order.items.length} itens)
                    </option>
                  ))}
                </select>
                {selectedOrderId && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "1rem",
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#16a34a",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Package size={16} />
                      Ordem vinculada
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "#166534",
                      }}
                    >
                      Os itens desta ordem foram carregados automaticamente
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="sale-form-section">
            <h3>Itens para Despacho</h3>
            {dispatchItems.map((dispatchItem, index) => {
              const selectedItem = items.find(
                (item) => item.id === dispatchItem.itemId
              );
              const isInvalid =
                selectedItem && dispatchItem.quantity > selectedItem.quantity;

              return (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto",
                    gap: "1rem",
                    marginBottom: "1rem",
                    alignItems: "start",
                  }}
                >
                  <div className="sale-form-group">
                    <label>Item {index + 1}</label>
                    <select
                      value={dispatchItem.itemId}
                      onChange={(e) =>
                        updateItem(index, "itemId", e.target.value)
                      }
                      required
                    >
                      <option value="">Selecione...</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.model} (Disp: {item.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sale-form-group">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      value={dispatchItem.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      min="1"
                      max={selectedItem?.quantity || undefined}
                      required
                      style={{
                        borderColor: isInvalid ? "#ef4444" : undefined,
                      }}
                    />
                    {isInvalid && (
                      <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                        Quantidade excede o estoque
                      </span>
                    )}
                  </div>

                  {dispatchItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      style={{
                        marginTop: "1.7rem",
                        padding: "0.75rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addItem}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                background: "#f1f5f9",
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                color: "#64748b",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Plus size={18} />
              Adicionar Item
            </button>
          </div>

          <div className="sale-form-section">
            <h3>Destino e Data</h3>
            <div className="sale-form-group">
              <label>Endereço de Destino *</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                placeholder="Endereço completo"
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Data do Despacho *</label>
                <input
                  type="date"
                  value={formData.dispatchDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dispatchDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="sale-form-group">
                <label>Previsão de Entrega</label>
                <input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDelivery: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Responsável pela Instalação</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Técnico</label>
                <input
                  type="text"
                  value={formData.technician}
                  onChange={(e) =>
                    setFormData({ ...formData, technician: e.target.value })
                  }
                />
              </div>
              <div className="sale-form-group">
                <label>Contato do Técnico</label>
                <input
                  type="text"
                  value={formData.technicianContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      technicianContact: e.target.value,
                    })
                  }
                  placeholder="Telefone ou email"
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Rastreamento e Observações</h3>
            <div className="sale-form-group">
              <label>Código de Rastreamento</label>
              <input
                type="text"
                value={formData.trackingCode}
                onChange={(e) =>
                  setFormData({ ...formData, trackingCode: e.target.value })
                }
              />
            </div>
            <div className="sale-form-group">
              <label>Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Observações sobre o despacho..."
              />
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
                  Despachando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Criar Despacho
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
