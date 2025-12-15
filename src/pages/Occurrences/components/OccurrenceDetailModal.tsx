import { useState } from 'react';
import { X, User, Calendar, AlertCircle, MessageSquare, Image as ImageIcon, Send } from 'lucide-react';
import { occurrencesService } from '../../../services/occurrencesService';
import type { Occurrence, OccurrenceStatus } from '../../../types/occurrences';
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_PRIORITY_LABELS, OCCURRENCE_TYPE_LABELS } from '../../../types/occurrences';
import './OccurrenceDetailModal.css';

interface OccurrenceDetailModalProps {
  occurrence: Occurrence;
  onClose: () => void;
  onUpdate: () => void;
}

export default function OccurrenceDetailModal({
  occurrence,
  onClose,
  onUpdate,
}: OccurrenceDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'communications' | 'photos'>('details');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: OccurrenceStatus) => {
    if (updatingStatus) return;

    try {
      setUpdatingStatus(true);
      await occurrencesService.updateStatus(occurrence.id, newStatus);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await occurrencesService.addCommunication(occurrence.id, {
        userId: 'current-user-id',
        userName: 'Atendente',
        message: newMessage,
        isInternal: false,
      });
      setNewMessage('');
      onUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleAddPhoto = async () => {
    // Simulated photo upload
    const photoUrl = `https://via.placeholder.com/400x300?text=Foto+${occurrence.photos.length + 1}`;
    try {
      await occurrencesService.addPhoto(occurrence.id, {
        url: photoUrl,
        type: 'general',
        description: 'Foto adicionada',
      });
      onUpdate();
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Erro ao adicionar foto');
    }
  };

  const getStatusBadgeClass = (status: OccurrenceStatus): string => {
    const baseClass = 'occurrence-detail-badge';
    switch (status) {
      case 'open':
        return `${baseClass} occurrence-detail-badge-warning`;
      case 'in_progress':
        return `${baseClass} occurrence-detail-badge-info`;
      case 'resolved':
        return `${baseClass} occurrence-detail-badge-success`;
      case 'cancelled':
        return `${baseClass} occurrence-detail-badge-default`;
      default:
        return baseClass;
    }
  };

  const getPriorityBadgeClass = (priority: Occurrence['priority']): string => {
    const baseClass = 'occurrence-detail-badge';
    switch (priority) {
      case 'urgent':
        return `${baseClass} occurrence-detail-badge-danger`;
      case 'high':
        return `${baseClass} occurrence-detail-badge-warning`;
      case 'medium':
        return `${baseClass} occurrence-detail-badge-info`;
      case 'low':
        return `${baseClass} occurrence-detail-badge-default`;
      default:
        return baseClass;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="occurrence-detail-overlay" onClick={onClose}>
      <div className="occurrence-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="occurrence-detail-header">
          <div>
            <h2>Ocorrência #{occurrence.id.slice(-6).toUpperCase()}</h2>
            <p className="occurrence-detail-subtitle">{occurrence.title}</p>
          </div>
          <button className="occurrence-detail-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="occurrence-detail-tabs">
          <button
            className={`occurrence-detail-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Detalhes
          </button>
          <button
            className={`occurrence-detail-tab ${activeTab === 'communications' ? 'active' : ''}`}
            onClick={() => setActiveTab('communications')}
          >
            Comunicações
            {occurrence.communications.length > 0 && (
              <span className="occurrence-detail-tab-badge">{occurrence.communications.length}</span>
            )}
          </button>
          <button
            className={`occurrence-detail-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Fotos
            {occurrence.photos.length > 0 && (
              <span className="occurrence-detail-tab-badge">{occurrence.photos.length}</span>
            )}
          </button>
        </div>

        <div className="occurrence-detail-content">
          {activeTab === 'details' && (
            <div className="occurrence-detail-section">
              <div className="occurrence-detail-info-grid">
                <div className="occurrence-detail-info-item">
                  <label>Cliente</label>
                  <div className="occurrence-detail-info-value">
                    <User size={16} />
                    {occurrence.clientName}
                  </div>
                </div>

                <div className="occurrence-detail-info-item">
                  <label>Status</label>
                  <span className={getStatusBadgeClass(occurrence.status)}>
                    {OCCURRENCE_STATUS_LABELS[occurrence.status]}
                  </span>
                </div>

                <div className="occurrence-detail-info-item">
                  <label>Prioridade</label>
                  <span className={getPriorityBadgeClass(occurrence.priority)}>
                    {OCCURRENCE_PRIORITY_LABELS[occurrence.priority]}
                  </span>
                </div>

                <div className="occurrence-detail-info-item">
                  <label>Tipo</label>
                  <div className="occurrence-detail-info-value">
                    <AlertCircle size={16} />
                    {OCCURRENCE_TYPE_LABELS[occurrence.type]}
                  </div>
                </div>

                <div className="occurrence-detail-info-item">
                  <label>Data de Abertura</label>
                  <div className="occurrence-detail-info-value">
                    <Calendar size={16} />
                    {formatDate(occurrence.createdAt)}
                  </div>
                </div>

                <div className="occurrence-detail-info-item">
                  <label>Técnico Responsável</label>
                  <div className="occurrence-detail-info-value">
                    {occurrence.assignedTechnicianName || (
                      <span className="occurrence-detail-sub">Não atribuído</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="occurrence-detail-description">
                <label>Descrição</label>
                <p>{occurrence.description}</p>
              </div>

              <div className="occurrence-detail-actions">
                <label>Atualizar Status</label>
                <div className="occurrence-detail-status-buttons">
                  {occurrence.status !== 'in_progress' && (
                    <button
                      className="occurrence-detail-status-btn occurrence-detail-status-progress"
                      onClick={() => handleStatusChange('in_progress')}
                      disabled={updatingStatus}
                    >
                      Iniciar Atendimento
                    </button>
                  )}
                  {occurrence.status !== 'resolved' && (
                    <button
                      className="occurrence-detail-status-btn occurrence-detail-status-resolved"
                      onClick={() => handleStatusChange('resolved')}
                      disabled={updatingStatus}
                    >
                      Marcar como Resolvida
                    </button>
                  )}
                  {occurrence.status !== 'cancelled' && (
                    <button
                      className="occurrence-detail-status-btn occurrence-detail-status-cancelled"
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={updatingStatus}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="occurrence-detail-section">
              <div className="occurrence-detail-communications">
                {occurrence.communications.length === 0 ? (
                  <div className="occurrence-detail-empty">
                    <MessageSquare size={48} />
                    <p>Nenhuma comunicação registrada</p>
                  </div>
                ) : (
                  <div className="occurrence-detail-messages">
                    {occurrence.communications.map((comm) => (
                      <div key={comm.id} className="occurrence-detail-message">
                        <div className="occurrence-detail-message-header">
                          <strong>{comm.userName}</strong>
                          <span className="occurrence-detail-message-date">
                            {formatDate(comm.createdAt)}
                          </span>
                        </div>
                        <p className="occurrence-detail-message-text">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="occurrence-detail-new-message">
                <textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
                <button
                  className="occurrence-detail-send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  <Send size={18} />
                  Enviar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="occurrence-detail-section">
              <div className="occurrence-detail-photos">
                {occurrence.photos.length === 0 ? (
                  <div className="occurrence-detail-empty">
                    <ImageIcon size={48} />
                    <p>Nenhuma foto anexada</p>
                  </div>
                ) : (
                  <div className="occurrence-detail-photos-grid">
                    {occurrence.photos.map((photo) => (
                      <div key={photo.id} className="occurrence-detail-photo">
                        <img src={photo.url} alt={photo.description || 'Foto'} />
                        {photo.description && (
                          <p className="occurrence-detail-photo-desc">{photo.description}</p>
                        )}
                        <span className="occurrence-detail-photo-date">
                          {formatDate(photo.uploadedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="occurrence-detail-add-photo-btn" onClick={handleAddPhoto}>
                <ImageIcon size={18} />
                Adicionar Foto (Simulado)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

