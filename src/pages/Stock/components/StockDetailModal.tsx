import { useState, useEffect } from "react";
import type { StockItem, StockMovement } from "../../../types/stock";
import { stockService } from "../../../services/stockService";
import {
  CATEGORY_LABELS,
  STOCK_STATUS_LABELS,
  MOVEMENT_TYPE_LABELS,
} from "../../../types/stock";
import { X, TrendingUp, TrendingDown, Package } from "lucide-react";
import "../../Sales/components/SaleDetailModal.css";

interface StockDetailModalProps {
  item: StockItem;
  onClose: () => void;
}

export function StockDetailModal({ item, onClose }: StockDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "movements">("info");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const data = await stockService.getMovementsByItem(item.id);
        setMovements(data);
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "movements") {
      loadMovements();
    }
  }, [activeTab, item.id]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isLowStock = item.quantity <= item.minimumStock;

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div
        className="detail-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-modal-header">
          <div className="detail-modal-header-content">
            <h2>Detalhes do Item</h2>
            <p className="detail-modal-sale-id">
              {item.name} - {item.model}
            </p>
          </div>
          <button className="detail-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="detail-modal-tabs">
          {["info", "movements"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`detail-tab-button ${
                activeTab === tab ? "active" : ""
              }`}
            >
              {tab === "info" ? "Informações" : "Histórico"}
            </button>
          ))}
        </div>

        <div className="detail-modal-content">
          {activeTab === "info" && (
            <div className="detail-info-section">
              <div>
                <h3 className="detail-section-title">Informações Gerais</h3>
                <div className="detail-plan-card">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Nome
                      </p>
                      <p className="detail-plan-name">{item.name}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Modelo
                      </p>
                      <p className="detail-plan-name">{item.model}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Categoria
                      </p>
                      <p className="detail-plan-name">
                        {CATEGORY_LABELS[item.category]}
                      </p>
                    </div>
                    {item.manufacturer && (
                      <div>
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "0.85rem",
                            color: "#64748b",
                          }}
                        >
                          Fabricante
                        </p>
                        <p className="detail-plan-name">{item.manufacturer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="detail-section-title">Estoque</h3>
                <div className="detail-plan-card">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Quantidade
                      </p>
                      <p
                        className="detail-plan-value"
                        style={{ color: isLowStock ? "#f59e0b" : "#059669" }}
                      >
                        {item.quantity} un.
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Reservado
                      </p>
                      <p
                        className="detail-plan-value"
                        style={{ color: "#6366f1" }}
                      >
                        {item.reservedQuantity} un.
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Estoque Mínimo
                      </p>
                      <p
                        className="detail-plan-value"
                        style={{ color: "#64748b" }}
                      >
                        {item.minimumStock} un.
                      </p>
                    </div>
                  </div>
                  {isLowStock && (
                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "0.75rem",
                        background: "#fef3c7",
                        borderRadius: "8px",
                        color: "#92400e",
                        fontSize: "0.9rem",
                      }}
                    >
                      ⚠️ Estoque abaixo do mínimo!
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="detail-section-title">Localização</h3>
                <div className="detail-plan-card">
                  <p className="detail-plan-name">{item.location.warehouse}</p>
                  {item.location.shelf && (
                    <p className="detail-plan-description">
                      Prateleira: {item.location.shelf}
                      {item.location.position &&
                        ` - Posição: ${item.location.position}`}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="detail-section-title">Informações Adicionais</h3>
                <div className="detail-plan-card">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Status
                      </p>
                      <p className="detail-plan-name">
                        {STOCK_STATUS_LABELS[item.status]}
                      </p>
                    </div>
                    {item.unitPrice && (
                      <div>
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "0.85rem",
                            color: "#64748b",
                          }}
                        >
                          Preço Unitário
                        </p>
                        <p className="detail-plan-value">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    )}
                    {item.supplier && (
                      <div>
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "0.85rem",
                            color: "#64748b",
                          }}
                        >
                          Fornecedor
                        </p>
                        <p className="detail-plan-name">{item.supplier}</p>
                      </div>
                    )}
                  </div>
                  {item.notes && (
                    <div style={{ marginTop: "1rem" }}>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        Observações
                      </p>
                      <p style={{ margin: 0, color: "#334155" }}>
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "movements" && (
            <div>
              <h3 className="detail-section-title">
                Histórico de Movimentações
              </h3>

              {loading ? (
                <div className="detail-empty-state">
                  <p>Carregando movimentações...</p>
                </div>
              ) : movements.length === 0 ? (
                <div className="detail-empty-state">
                  <Package size={48} className="detail-empty-icon" />
                  <p>Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <div className="detail-timeline">
                  {movements.map((movement, index) => (
                    <div key={movement.id} className="detail-timeline-item">
                      {index < movements.length - 1 && (
                        <div className="detail-timeline-line" />
                      )}
                      <div
                        className="detail-timeline-dot"
                        style={{
                          background:
                            movement.quantity > 0 ? "#059669" : "#ef4444",
                        }}
                      />
                      <div className="detail-timeline-card">
                        <div className="detail-timeline-header">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            {movement.quantity > 0 ? (
                              <TrendingUp size={18} color="#059669" />
                            ) : (
                              <TrendingDown size={18} color="#ef4444" />
                            )}
                            <strong className="detail-timeline-title">
                              {MOVEMENT_TYPE_LABELS[movement.type]}
                            </strong>
                          </div>
                          <span className="detail-timeline-date">
                            {formatDate(movement.createdAt as Date)}
                          </span>
                        </div>
                        <p className="detail-timeline-notes">
                          {movement.description}
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "0.5rem",
                            marginTop: "0.75rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div>
                            <span style={{ color: "#64748b" }}>
                              Quantidade:{" "}
                            </span>
                            <strong
                              style={{
                                color:
                                  movement.quantity > 0 ? "#059669" : "#ef4444",
                              }}
                            >
                              {movement.quantity > 0 ? "+" : ""}
                              {movement.quantity} un.
                            </strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Anterior: </span>
                            <strong>{movement.previousQuantity} un.</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Novo: </span>
                            <strong>{movement.newQuantity} un.</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="detail-modal-footer">
          <button className="detail-btn-close" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
