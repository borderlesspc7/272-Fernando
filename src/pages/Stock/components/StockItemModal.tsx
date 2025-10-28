import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
  StockItem,
  CreateStockItemData,
  UpdateStockItemData,
} from "../../../types/stock";
import { CATEGORY_LABELS } from "../../../types/stock";
import { stockService } from "../../../services/stockService";
import { X, Save, Loader2 } from "lucide-react";
import "../../Sales/components/SaleModal.css";

interface StockItemModalProps {
  item?: StockItem | null;
  onClose: () => void;
  onSuccess: () => void;
  createdBy: string;
}

export function StockItemModal({
  item,
  onClose,
  onSuccess,
  createdBy,
}: StockItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    category: "router" as any,
    manufacturer: "",
    quantity: 0,
    minimumStock: 5,
    warehouse: "Almoxarifado Principal",
    shelf: "",
    position: "",
    status: "available" as any,
    unitPrice: 0,
    supplier: "",
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        model: item.model,
        category: item.category,
        manufacturer: item.manufacturer || "",
        quantity: item.quantity,
        minimumStock: item.minimumStock,
        warehouse: item.location.warehouse,
        shelf: item.location.shelf || "",
        position: item.location.position || "",
        status: item.status,
        unitPrice: item.unitPrice || 0,
        supplier: item.supplier || "",
        notes: item.notes || "",
      });
    }
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.model) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (item) {
        // Atualizar
        const updateData: UpdateStockItemData = {
          name: formData.name,
          model: formData.model,
          category: formData.category,
          manufacturer: formData.manufacturer || undefined,
          minimumStock: formData.minimumStock,
          location: {
            warehouse: formData.warehouse,
            shelf: formData.shelf || undefined,
            position: formData.position || undefined,
          },
          status: formData.status,
          unitPrice: formData.unitPrice || undefined,
          supplier: formData.supplier || undefined,
          notes: formData.notes || undefined,
        };

        await stockService.updateItem(item.id, updateData);
      } else {
        // Criar
        const createData: CreateStockItemData = {
          name: formData.name,
          model: formData.model,
          category: formData.category,
          manufacturer: formData.manufacturer || undefined,
          quantity: formData.quantity,
          minimumStock: formData.minimumStock,
          location: {
            warehouse: formData.warehouse,
            shelf: formData.shelf || undefined,
            position: formData.position || undefined,
          },
          status: formData.status,
          unitPrice: formData.unitPrice || undefined,
          supplier: formData.supplier || undefined,
          notes: formData.notes || undefined,
          createdBy,
        };

        await stockService.createItem(createData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sale-modal-overlay" onClick={onClose}>
      <div
        className="sale-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px" }}
      >
        <div className="sale-modal-header">
          <h2>{item ? "Editar Item" : "Novo Item de Estoque"}</h2>
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
            <h3>Informações Básicas</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="sale-form-group">
                <label>Modelo *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  required
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sale-form-group">
                <label>Fabricante</label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Quantidade e Preço</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1rem",
              }}
            >
              {!item && (
                <div className="sale-form-group">
                  <label>Quantidade Inicial *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value),
                      })
                    }
                    min="0"
                    required
                  />
                </div>
              )}
              <div className="sale-form-group">
                <label>Estoque Mínimo *</label>
                <input
                  type="number"
                  value={formData.minimumStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumStock: Number(e.target.value),
                    })
                  }
                  min="0"
                  required
                />
              </div>
              <div className="sale-form-group">
                <label>Preço Unitário (R$)</label>
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
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Localização</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Almoxarifado *</label>
                <input
                  type="text"
                  value={formData.warehouse}
                  onChange={(e) =>
                    setFormData({ ...formData, warehouse: e.target.value })
                  }
                  required
                />
              </div>
              <div className="sale-form-group">
                <label>Prateleira</label>
                <input
                  type="text"
                  value={formData.shelf}
                  onChange={(e) =>
                    setFormData({ ...formData, shelf: e.target.value })
                  }
                  placeholder="Ex: A1"
                />
              </div>
              <div className="sale-form-group">
                <label>Posição</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="Ex: 3"
                />
              </div>
            </div>
          </div>

          <div className="sale-form-section">
            <h3>Informações Adicionais</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="sale-form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <option value="available">Disponível</option>
                  <option value="reserved">Reservado</option>
                  <option value="separated">Separado</option>
                  <option value="dispatched">Despachado</option>
                  <option value="in_maintenance">Em Manutenção</option>
                  <option value="defective">Defeituoso</option>
                </select>
              </div>
              <div className="sale-form-group">
                <label>Fornecedor</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="sale-form-group">
              <label>Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Observações sobre o item..."
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
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {item ? "Atualizar" : "Criar Item"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
