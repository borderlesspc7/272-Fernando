import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Installation,
  InstallationStatus,
} from "../../../types/installations";
import { INSTALLATION_STATUS_LABELS } from "../../../types/installations";
import { installationsService } from "../../../services/installationsService";
import {
  X,
  User,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import "./InstallationDetailModal.css";

interface Props {
  installation: Installation;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function InstallationDetailModal({
  installation,
  onClose,
  onSuccess,
  userId,
}: Props) {
  const [tab, setTab] = useState<"info" | "photos">("info");
  const [status, setStatus] = useState<InstallationStatus>(installation.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoDesc, setPhotoDesc] = useState("");

  const fmtDateTime = (d?: Date) =>
    d
      ? new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(d)
      : "-";

  const handleStatus = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await installationsService.updateInstallation(installation.id, {
        status,
        startedAt:
          status === "in_progress" && !installation.startedAt
            ? new Date()
            : undefined,
        completedAt: status === "completed" ? new Date() : undefined,
      });
      if (status === "completed") {
        console.log("Instalação concluída, OS feita");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!photoName) {
      setError("Informe o nome da foto");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const simulatedUrl = `https://storage.example.com/installations/${
        installation.id
      }/${Date.now()}_${photoName}`;
      await installationsService.addPhoto(installation.id, {
        url: simulatedUrl,
        description: photoDesc || undefined,
        uploadedBy: userId,
      });
      setPhotoName("");
      setPhotoDesc("");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar foto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="installation-modal-overlay" onClick={onClose}>
      <div className="installation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="installation-header">
          <h2>Detalhes da Instalação</h2>
          <button className="installation-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="installation-tabs">
          <button
            className={`installation-tab ${tab === "info" ? "active" : ""}`}
            onClick={() => setTab("info")}
          >
            <Wrench size={18} />
            Informações
          </button>
          <button
            className={`installation-tab ${tab === "photos" ? "active" : ""}`}
            onClick={() => setTab("photos")}
          >
            <ImageIcon size={18} />
            Fotos ({installation.photos.length})
          </button>
        </div>

        <div className="installation-content">
          {tab === "info" && (
            <div className="installation-grid">
              <div className="installation-card">
                <h3>
                  <User size={16} />
                  Cliente
                </h3>
                <p>
                  <strong>Nome:</strong> {installation.clientName}
                </p>
                {installation.clientPhone && (
                  <p>
                    <strong>Telefone:</strong> {installation.clientPhone}
                  </p>
                )}
                <p className="install-address">
                  <MapPin size={14} /> {installation.clientAddress}
                </p>
              </div>

              <div className="installation-card">
                <h3>
                  <Wrench size={16} />
                  Técnico
                </h3>
                <p>
                  <strong>Nome:</strong> {installation.technicianName || "-"}
                </p>

                <p>
                  <strong>Telefone:</strong>{" "}
                  {installation.technicianPhone || "-"}
                </p>
              </div>

              <div className="installation-card">
                <h3>
                  <Calendar size={16} />
                  Datas
                </h3>
                <p>
                  <strong>Agendada:</strong>{" "}
                  {fmtDateTime(installation.scheduledDate as Date)}
                </p>
                <p>
                  <strong>Iniciada:</strong>{" "}
                  {fmtDateTime(installation.startedAt as Date)}
                </p>
                <p>
                  <strong>Concluída:</strong>{" "}
                  {fmtDateTime(installation.completedAt as Date)}
                </p>
              </div>

              <div className="installation-card">
                <h3>Equipamentos</h3>
                <ul className="installation-equip-list">
                  {installation.equipments.map((eq) => (
                    <li key={eq.itemId}>
                      {eq.itemName} - {eq.model} (x{eq.quantity})
                      {eq.serialNumber && ` (SN: ${eq.serialNumber})`}
                    </li>
                  ))}
                </ul>
              </div>

              {installation.notes && (
                <div className="installation-card">
                  <h3>Observações</h3>
                  <p>{installation.notes}</p>
                </div>
              )}

              <div className="installation-card">
                <h3>Status</h3>
                {error && <div className="installation-error">{error}</div>}
                <form onSubmit={handleStatus} className="installation-form">
                  <label>Novo status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as InstallationStatus)
                    }
                  >
                    {Object.entries(INSTALLATION_STATUS_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Atualizar
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {tab === "photos" && (
            <div className="installation-photos">
              <div className="installation-upload">
                <h3>
                  <Upload size={16} />
                  Enviar foto (simulado)
                </h3>
                {error && <div className="installation-error">{error}</div>}
                <form onSubmit={handlePhoto} className="installation-form">
                  <label>Nome do arquivo</label>
                  <input
                    type="text"
                    value={photoName}
                    onChange={(e) => setPhotoName(e.target.value)}
                    placeholder="ex: instalacao_roteador.jpg"
                  />
                  <label>Descrição</label>
                  <textarea
                    value={photoDesc}
                    onChange={(e) => setPhotoDesc(e.target.value)}
                    placeholder="Ex: Foto do roteador instalado"
                    rows={2}
                  />
                  <button
                    type="submit"
                    className="btn-secondary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Enviar (simulado)
                      </>
                    )}
                  </button>
                </form>
              </div>
              <div className="installation-photos-grid">
                {installation.photos.length === 0 ? (
                  <p className="installation-empty">Nenhuma foto enviada</p>
                ) : (
                  installation.photos.map((photo) => (
                    <div key={photo.id} className="installation-photo-card">
                      <div className="installation-photo-thumb" />
                      <div className="installation-photo-info">
                        <p className="installation-photo-name">
                          {photo.url.split("/").pop()}
                        </p>
                        {photo.description && (
                          <p className="installation-photo-desc">
                            {photo.description}
                          </p>
                        )}
                        <p className="installation-photo-date">
                          {fmtDateTime(photo.uploadedAt as Date)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
