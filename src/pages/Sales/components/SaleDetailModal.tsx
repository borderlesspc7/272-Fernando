import { useState } from "react";
import type { Sale, SaleDocument } from "../../../types/sales";
import { salesService } from "../../../services/salesService";
import { useAuth } from "../../../hooks/useAuth";
import { X, Upload, FileText } from "lucide-react";
import "./SaleDetailModal.css";

interface SaleDetailModalProps {
  sale: Sale;
  onClose: () => void;
  onUpdate: () => void;
}

export function SaleDetailModal({
  sale,
  onClose,
  onUpdate,
}: SaleDetailModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "timeline" | "documents">(
    "info"
  );
  const [updating, setUpdating] = useState(false);
  const [uploadName, setUploadName] = useState("");

  const handleStatusUpdate = async (newStatus: Sale["status"]) => {
    try {
      setUpdating(true);
      await salesService.updateSaleStatus(
        sale.id,
        newStatus,
        `Atualizado para: ${newStatus}`,
        user?.uid || ""
      );
      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar status", error);
      alert("Erro ao atualizar status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!uploadName) return;

    try {
      const mockDocument: Omit<SaleDocument, "id" | "uploadedAt"> = {
        name: uploadName,
        type: "other",
        url: `https://mock-storage.com/${Date.now()}-${uploadName}`,
        uploadedBy: user?.uid || "",
      };

      await salesService.addDocument(sale.id, mockDocument, user?.uid || "");
      setUploadName("");
      onUpdate();
    } catch (error) {
      console.error("Erro ao adicionar documento", error);
      alert("Erro ao adicionar documento");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div
        className="detail-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-modal-header">
          <div className="detail-modal-header-content">
            <h2>Detalhes da Venda</h2>
            <p className="detail-modal-sale-id">#{sale.id.slice(0, 12)}</p>
          </div>
          <button className="detail-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="detail-modal-tabs">
          {["info", "timeline", "documents"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as "info" | "timeline" | "documents")
              }
              className={`detail-tab-button ${
                activeTab === tab ? "active" : ""
              }`}
            >
              {tab === "info"
                ? "Informações"
                : tab === "timeline"
                ? "Jornada"
                : "Documentos"}
            </button>
          ))}
        </div>

        <div className="detail-modal-content">
          {activeTab === "info" && (
            <div className="detail-info-section">
              <div>
                <h3 className="detail-section-title">Cliente</h3>
                <p className="detail-client-name">{sale.clientName}</p>
              </div>

              <div>
                <h3 className="detail-section-title">Plano</h3>
                <div className="detail-plan-card">
                  <p className="detail-plan-name">{sale.plan.name}</p>
                  <p className="detail-plan-description">
                    {sale.plan.description}
                  </p>
                  <p className="detail-plan-value">
                    R$ {sale.plan.value.toFixed(2)}/mês
                  </p>
                </div>
              </div>

              <div>
                <h3 className="detail-section-title">Equipamentos</h3>
                {sale.equipments.map((eq) => (
                  <div key={eq.id} className="detail-equipment-item">
                    <span className="detail-equipment-name">
                      {eq.name} - {eq.model}
                    </span>
                    <span className="detail-equipment-quantity">
                      Qtd: {eq.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="detail-section-title">Atualizar Status</h3>
                <select
                  onChange={(e) =>
                    handleStatusUpdate(e.target.value as Sale["status"])
                  }
                  disabled={updating}
                  value={sale.status}
                  className="detail-status-select"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="stock_separated">Estoque Separado</option>
                  <option value="dispatched">Despachado</option>
                  <option value="installing">Instalando</option>
                  <option value="active">Ativo</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div>
              <h3 className="detail-section-title">Jornada da Venda</h3>
              <div className="detail-timeline">
                {sale.timeline.map((event, index) => (
                  <div key={event.id} className="detail-timeline-item">
                    {index < sale.timeline.length - 1 && (
                      <div className="detail-timeline-line" />
                    )}
                    <div className="detail-timeline-dot" />
                    <div className="detail-timeline-card">
                      <div className="detail-timeline-header">
                        <strong className="detail-timeline-title">
                          {event.description}
                        </strong>
                        <span className="detail-timeline-date">
                          {formatDate(event.createdAt as Date)}
                        </span>
                      </div>
                      {event.notes && (
                        <p className="detail-timeline-notes">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <h3 className="detail-section-title">Documentos Anexados</h3>

              <div className="detail-upload-area">
                <p className="detail-upload-info">
                  <strong>Upload Simulado:</strong> Os arquivos não são salvos
                  no servidor
                </p>
                <div className="detail-upload-form">
                  <input
                    type="text"
                    placeholder="Nome do documento..."
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="detail-upload-input"
                  />
                  <button
                    onClick={handleDocumentUpload}
                    disabled={!uploadName}
                    className="detail-upload-button"
                  >
                    <Upload size={18} />
                  </button>
                </div>
              </div>

              {sale.documents.length === 0 ? (
                <div className="detail-empty-state">
                  <FileText size={48} className="detail-empty-icon" />
                  <p>Nenhum documento anexado</p>
                </div>
              ) : (
                <div className="detail-documents-list">
                  {sale.documents.map((doc) => (
                    <div key={doc.id} className="detail-document-item">
                      <FileText
                        size={24}
                        color="#6366f1"
                        className="detail-document-icon"
                      />
                      <div className="detail-document-info">
                        <p className="detail-document-name">{doc.name}</p>
                        <p className="detail-document-date">
                          {formatDate(doc.uploadedAt as Date)}
                        </p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-document-link"
                      >
                        Ver Documento
                      </a>
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
