import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { StockItem } from "../../../types/stock";
import { stockService } from "../../../services/stockService";
import { X, Save, Loader2 } from "lucide-react";
import "../../Sales/components/SaleModal.css";

interface StockEntryModalProps {
  onClose: () => void;
  onSuccess: () => void;
  createdBy: string;
}

export function StockEntryModal({
  onClose,
  onSuccess,
  createdBy,
}: StockEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);

  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 0,
    unitPrice: 0,
    supplier: "",
    invoiceNumber: "",
    invoiceDate: "",
    notes: "",
  });

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await stockService.getAllItems();
        setItems(data);
      } catch (error) {
        console.error("Erro ao carregar items:", error);
      }
    };
    loadItems();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.itemId || formData.quantity <= 0) {
      setError("Selecione um item e informe a quantidade");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await stockService.createEntry({
        itemId: formData.itemId,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber || undefined,
        invoiceDate: formData.invoiceDate
          ? new Date(formData.invoiceDate)
          : undefined,
        notes: formData.notes || undefined,
        createdBy,
      });

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao registrar entrada"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find((item) => item.id === formData.itemId);
  const totalValue = formData.quantity * formData.unitPrice;

  return (
    <div className="sale-modal-overlay" onClick={onClose}>
      <div
        className="sale-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sale-modal-header">
          <h2>Entrada de Equipamentos</h2>
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
            <h3>Selecionar Item</h3>
            <div className="sale-form-group">
              <select
                value={formData.itemId}
                onChange={(e) => {
                  const item = items.find((i) => i.id === e.target.value);
                  setFormData({
                    ...formData,
                    itemId: e.target.value,
                    unitPrice: item?.unitPrice || 0,
                  });
                }}
                required
              >
                <option value="">Selecione um item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.model} (Estoque atual: {item.quantity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Quantidade e Valor</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  min="1"
                  required
                />
              </div>
              <div className="sale-form-group">
                <label>Preço Unitário (R$) *</label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: Number(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Fornecedor e Nota Fiscal</h3>
            <div className="sale-form-group">
              <label>Fornecedor *</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
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
                <label>Número da NF</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                />
              </div>
              <div className="sale-form-group">
                <label>Data da NF</label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Observações</h3>
            <div className="sale-form-group">
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Observações sobre a entrada..."
              />
            </div>
          </div>

          {selectedItem && formData.quantity > 0 && (
            <div className="sale-summary">
              <div className="summary-row">
                <span>Item:</span>
                <strong>{selectedItem.name}</strong>
              </div>
              <div className="summary-row">
                <span>Estoque Atual:</span>
                <strong>{selectedItem.quantity} un.</strong>
              </div>
              <div className="summary-row">
                <span>Nova Quantidade:</span>
                <strong>{selectedItem.quantity + formData.quantity} un.</strong>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Valor Total:</span>
                <span className="summary-total-value">
                  R$ {totalValue.toFixed(2)}
                </span>
              </div>
            </div>
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
                  Registrando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Registrar Entrada
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
