import { useState } from "react";
import type { FormEvent } from "react";
import type { Dispatch, DispatchStatus } from "../../../types/logistics";
import {
  DISPATCH_STATUS_LABELS,
  DISPATCH_PRIORITY_LABELS,
  TRANSPORT_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
} from "../../../types/logistics";
import { logisticsService } from "../../../services/logisticsService";
import {
  X,
  Package,
  MapPin,
  User,
  Calendar,
  Truck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import "./LogisticsDetailModal.css";

interface LogisticsDetailModalProps {
  dispatch: Dispatch;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function LogisticsDetailModal({
  dispatch,
  onClose,
  onSuccess,
  userId,
}: LogisticsDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "tracking" | "documents">(
    "info"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado para atualização de status
  const [newStatus, setNewStatus] = useState<DispatchStatus>(dispatch.status);
  const [statusDescription, setStatusDescription] = useState("");
  const [statusLocation, setStatusLocation] = useState("");

  // Estado para delivery (quando entregue)
  const [recipientName, setRecipientName] = useState(
    dispatch.recipientName || ""
  );
  const [recipientDocument, setRecipientDocument] = useState(
    dispatch.recipientDocument || ""
  );
  const [deliveryNotes, setDeliveryNotes] = useState(
    dispatch.deliveryNotes || ""
  );

  // Estado para upload de documento
  const [documentType, setDocumentType] = useState<"delivery_proof" | "signature" | "photo" | "invoice" | "other">("delivery_proof");
  const [documentName, setDocumentName] = useState("");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const handleUpdateStatus = async (e: FormEvent) => {
    e.preventDefault();

    if (!statusDescription) {
      setError("Informe uma descrição para o evento");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await logisticsService.updateDispatchStatus(
        dispatch.id,
        newStatus,
        statusDescription,
        userId,
        statusLocation || undefined
      );

      // Se foi marcado como entregue, atualizar dados adicionais
      if (newStatus === "delivered" && (recipientName || deliveryNotes)) {
        await logisticsService.updateDispatch(dispatch.id, {
          recipientName: recipientName || undefined,
          recipientDocument: recipientDocument || undefined,
          deliveryNotes: deliveryNotes || undefined,
        });
      }

      setStatusDescription("");
      setStatusLocation("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e: FormEvent) => {
    e.preventDefault();

    if (!documentName) {
      setError("Informe o nome do documento");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // URL simulada
      const simulatedUrl = `https://storage.example.com/${dispatch.id}/${Date.now()}_${documentName}`;

      await logisticsService.addDocument(dispatch.id, {
        name: documentName,
        type: documentType,
        url: simulatedUrl,
        uploadedBy: userId,
      });

      setDocumentName("");
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao adicionar documento"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logistics-detail-overlay" onClick={onClose}>
      <div
        className="logistics-detail-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="logistics-detail-header">
          <h2>Detalhes do Despacho</h2>
          <button className="logistics-detail-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="logistics-detail-tabs">
          <button
            className={`logistics-detail-tab ${
              activeTab === "info" ? "active" : ""
            }`}
            onClick={() => setActiveTab("info")}
          >
            <Package size={18} />
            Informações
          </button>
          <button
            className={`logistics-detail-tab ${
              activeTab === "tracking" ? "active" : ""
            }`}
            onClick={() => setActiveTab("tracking")}
          >
            <MapPin size={18} />
            Rastreamento
          </button>
          <button
            className={`logistics-detail-tab ${
              activeTab === "documents" ? "active" : ""
            }`}
            onClick={() => setActiveTab("documents")}
          >
            <FileText size={18} />
            Documentos ({dispatch.documents.length})
          </button>
        </div>

        <div className="logistics-detail-content">
          {/* Tab: Informações */}
          {activeTab === "info" && (
            <div className="logistics-info-grid">
              <div className="logistics-info-section">
                <h3>
                  <User size={18} />
                  Cliente
                </h3>
                <div className="logistics-info-item">
                  <label>Nome:</label>
                  <span>{dispatch.clientName}</span>
                </div>
                {dispatch.clientPhone && (
                  <div className="logistics-info-item">
                    <label>Telefone:</label>
                    <span>{dispatch.clientPhone}</span>
                  </div>
                )}
                <div className="logistics-info-item">
                  <label>Endereço:</label>
                  <span>{dispatch.clientAddress}</span>
                </div>
              </div>

              <div className="logistics-info-section">
                <h3>
                  <Package size={18} />
                  Equipamentos
                </h3>
                {dispatch.items.map((item, index) => (
                  <div key={index} className="logistics-info-item">
                    <label>{item.itemName}:</label>
                    <span>
                      {item.model} x {item.quantity}
                      {item.serialNumber && ` (SN: ${item.serialNumber})`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="logistics-info-section">
                <h3>
                  <Truck size={18} />
                  Transporte
                </h3>
                <div className="logistics-info-item">
                  <label>Tipo:</label>
                  <span>{TRANSPORT_TYPE_LABELS[dispatch.transportType]}</span>
                </div>
                {dispatch.trackingCode && (
                  <div className="logistics-info-item">
                    <label>Código:</label>
                    <span>{dispatch.trackingCode}</span>
                  </div>
                )}
                {dispatch.carrier && (
                  <div className="logistics-info-item">
                    <label>Transportadora:</label>
                    <span>{dispatch.carrier}</span>
                  </div>
                )}
              </div>

              {dispatch.technicianName && (
                <div className="logistics-info-section">
                  <h3>
                    <User size={18} />
                    Técnico Responsável
                  </h3>
                  <div className="logistics-info-item">
                    <label>Nome:</label>
                    <span>{dispatch.technicianName}</span>
                  </div>
                  {dispatch.technicianPhone && (
                    <div className="logistics-info-item">
                      <label>Telefone:</label>
                      <span>{dispatch.technicianPhone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="logistics-info-section">
                <h3>
                  <Calendar size={18} />
                  Datas
                </h3>
                <div className="logistics-info-item">
                  <label>Despacho:</label>
                  <span>{formatDate(dispatch.dispatchDate as Date)}</span>
                </div>
                {dispatch.estimatedDeliveryDate && (
                  <div className="logistics-info-item">
                    <label>Previsão:</label>
                    <span>
                      {formatDate(dispatch.estimatedDeliveryDate as Date)}
                    </span>
                  </div>
                )}
                {dispatch.actualDeliveryDate && (
                  <div className="logistics-info-item">
                    <label>Entrega:</label>
                    <span>
                      {formatDate(dispatch.actualDeliveryDate as Date)}
                    </span>
                  </div>
                )}
              </div>

              <div className="logistics-info-section">
                <h3>
                  <AlertCircle size={18} />
                  Status Atual
                </h3>
                <div className="logistics-info-item">
                  <label>Status:</label>
                  <span>{DISPATCH_STATUS_LABELS[dispatch.status]}</span>
                </div>
                <div className="logistics-info-item">
                  <label>Prioridade:</label>
                  <span>{DISPATCH_PRIORITY_LABELS[dispatch.priority]}</span>
                </div>
                {dispatch.currentLocation && (
                  <div className="logistics-info-item">
                    <label>Localização:</label>
                    <span>{dispatch.currentLocation}</span>
                  </div>
                )}
              </div>

              {dispatch.status === "delivered" && (
                <div className="logistics-info-section">
                  <h3>
                    <CheckCircle2 size={18} />
                    Dados da Entrega
                  </h3>
                  {dispatch.recipientName && (
                    <div className="logistics-info-item">
                      <label>Recebido por:</label>
                      <span>{dispatch.recipientName}</span>
                    </div>
                  )}
                  {dispatch.recipientDocument && (
                    <div className="logistics-info-item">
                      <label>Documento:</label>
                      <span>{dispatch.recipientDocument}</span>
                    </div>
                  )}
                  {dispatch.deliveryNotes && (
                    <div className="logistics-info-item">
                      <label>Observações:</label>
                      <span>{dispatch.deliveryNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {dispatch.notes && (
                <div className="logistics-info-section">
                  <h3>Observações</h3>
                  <p className="logistics-no-data">{dispatch.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Rastreamento */}
          {activeTab === "tracking" && (
            <div className="logistics-tracking-container">
              <div className="logistics-update-status">
                <h3>Atualizar Status</h3>
                {error && (
                  <div className="logistics-error">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                <form onSubmit={handleUpdateStatus}>
                  <div className="logistics-form-row">
                    <div className="logistics-form-group">
                      <label>Novo Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) =>
                          setNewStatus(e.target.value as DispatchStatus)
                        }
                      >
                        {Object.entries(DISPATCH_STATUS_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="logistics-form-group">
                      <label>Localização Atual</label>
                      <input
                        type="text"
                        value={statusLocation}
                        onChange={(e) => setStatusLocation(e.target.value)}
                        placeholder="Ex: Centro de Distribuição SP"
                      />
                    </div>
                  </div>

                  <div className="logistics-form-group">
                    <label>Descrição do Evento *</label>
                    <textarea
                      value={statusDescription}
                      onChange={(e) => setStatusDescription(e.target.value)}
                      placeholder="Descreva o que aconteceu..."
                      rows={3}
                      required
                    />
                  </div>

                  {newStatus === "delivered" && (
                    <>
                      <h4>Dados da Entrega</h4>
                      <div className="logistics-form-row">
                        <div className="logistics-form-group">
                          <label>Recebido por</label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Nome de quem recebeu"
                          />
                        </div>
                        <div className="logistics-form-group">
                          <label>CPF/RG</label>
                          <input
                            type="text"
                            value={recipientDocument}
                            onChange={(e) =>
                              setRecipientDocument(e.target.value)
                            }
                            placeholder="Documento"
                          />
                        </div>
                      </div>
                      <div className="logistics-form-group">
                        <label>Observações da Entrega</label>
                        <textarea
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="Observações..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="logistics-btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="logistics-spinner" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Atualizar Status
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="logistics-timeline">
                <h3>Histórico de Rastreamento</h3>
                {dispatch.trackingEvents.length === 0 ? (
                  <p className="logistics-no-data">Nenhum evento registrado</p>
                ) : (
                  <div className="logistics-timeline-list">
                    {dispatch.trackingEvents
                      .slice()
                      .reverse()
                      .map((event) => (
                        <div key={event.id} className="logistics-timeline-item">
                          <div className="logistics-timeline-marker"></div>
                          <div className="logistics-timeline-content">
                            <div className="logistics-timeline-header">
                              <span className="logistics-timeline-status">
                                {DISPATCH_STATUS_LABELS[event.status]}
                              </span>
                              <span className="logistics-timeline-date">
                                {formatDate(event.createdAt as Date)}
                              </span>
                            </div>
                            <p className="logistics-timeline-description">
                              {event.description}
                            </p>
                            {event.location && (
                              <p className="logistics-timeline-location">
                                <MapPin size={14} />
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Documentos */}
          {activeTab === "documents" && (
            <div className="logistics-documents-container">
              <div className="logistics-upload-section">
                <h3>
                  <Upload size={18} />
                  Adicionar Documento
                </h3>
                {error && (
                  <div className="logistics-error">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                <form onSubmit={handleUploadDocument}>
                  <div className="logistics-form-row">
                    <div className="logistics-form-group">
                      <label>Tipo de Documento</label>
                      <select
                        value={documentType}
                        onChange={(e) =>
                          setDocumentType(
                            e.target.value as typeof documentType
                          )
                        }
                      >
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="logistics-form-group">
                      <label>Nome do Arquivo</label>
                      <input
                        type="text"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="Ex: comprovante_entrega.pdf"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="logistics-btn-secondary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="logistics-spinner" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Adicionar Documento (Simulado)
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="logistics-documents-list">
                <h3>Documentos Anexados</h3>
                {dispatch.documents.length === 0 ? (
                  <p className="logistics-no-data">Nenhum documento anexado</p>
                ) : (
                  <div className="logistics-documents-grid">
                    {dispatch.documents.map((doc) => (
                      <div key={doc.id} className="logistics-document-card">
                        <div className="logistics-document-icon">
                          <FileText size={24} />
                        </div>
                        <div className="logistics-document-info">
                          <p className="logistics-document-name">{doc.name}</p>
                          <p className="logistics-document-type">
                            {DOCUMENT_TYPE_LABELS[doc.type]}
                          </p>
                          <p className="logistics-document-date">
                            {formatDate(doc.uploadedAt as Date)}
                          </p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="logistics-document-link"
                        >
                          Ver
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

