import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
  Technician,
  CreateTechnicianData,
  UpdateTechnicianData,
  TechnicianRegion,
  TechnicianStatus,
} from "../../../../types/technicians";
import {
  TECHNICIAN_STATUS_LABELS,
  TECHNICIAN_REGION_LABELS,
} from "../../../../types/technicians";
import { techniciansService } from "../../../../services/techniciansService";
import { X, Save, Loader2 } from "lucide-react";
import "./TechnicianModal.css";

interface Props {
  technician: Technician | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TechnicianModal({ technician, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    region: "centro",
    status: "active",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    notes: "",
  });

  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        cpf: technician.cpf || "",
        region: technician.region,
        status: technician.status,
        address: technician.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        notes: technician.notes || "",
      });
    }
  }, [technician]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      setError("Preencha todos os campos obrigatórios (Nome, email, Telefone");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (technician) {
        const updateData: UpdateTechnicianData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf || undefined,
          region: formData.region as TechnicianRegion,
          status: formData.status as TechnicianStatus,
          address: formData.address?.street ? formData.address : undefined,
          notes: formData.notes || undefined,
        };

        await techniciansService.updateTechnician(technician.id, updateData);
      } else {
        await techniciansService.createTechnician(
          formData as CreateTechnicianData
        );
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar técnico");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value,
      },
    }));
  };

  return (
    <div className="technician-modal-overlay" onClick={onClose}>
      <div className="technician-modal" onClick={(e) => e.stopPropagation()}>
        <div className="technician-modal-header">
          <h2>{technician ? "Editar Técnico" : "Novo Técnico"}</h2>
          <button className="technician-modal-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="technician-modal-form">
          {error && <div className="technician-modal-error">{error}</div>}

          <div className="form-section">
            <h3>Dados Pessoais</h3>
            <div className="form-group">
              <label>
                Nome Completo <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Telefone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(11) 91234-5678"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleChange("cpf", e.target.value)}
                  placeholder="123.456.789-00"
                />
              </div>
              <div className="form-group">
                <label>
                  Região <span className="required">*</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleChange("region", e.target.value)}
                  required
                >
                  {Object.entries(TECHNICIAN_REGION_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {Object.entries(TECHNICIAN_STATUS_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Endereço (Opcional)</h3>
            <div className="form-group">
              <label>Rua</label>
              <input
                type="text"
                value={formData.address?.street || ""}
                onChange={(e) => handleAddressChange("street", e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={formData.address?.city || ""}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  value={formData.address?.state || ""}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={formData.address?.zipCode || ""}
                  onChange={(e) =>
                    handleAddressChange("zipCode", e.target.value)
                  }
                  placeholder="01234-567"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Observações</h3>
            <div className="form-group">
              <label>Notas</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                placeholder="Informações adicionais sobre o técnico..."
              />
            </div>
          </div>

          <div className="technician-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save size={18} /> Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
