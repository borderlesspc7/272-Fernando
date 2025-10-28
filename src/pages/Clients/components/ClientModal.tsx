import { useState } from "react";
import type { FormEvent } from "react";
import type { Client, CreateClientData, Address } from "../../../types/clients";
import { clientService } from "../../../services/clientsService";
import { X, Save, Plus, Trash2, Loader2 } from "lucide-react";
import "./ClientModal.css";

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
  createdBy: string;
}

export function ClientModal({
  client,
  onClose,
  onSuccess,
  createdBy,
}: ClientModalProps) {
  const isEditing = !!client;

  // Estados do formulário
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dados básicos
  const [name, setName] = useState(client?.name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [alternativePhone, setAlternativePhone] = useState(
    client?.alternativePhone || ""
  );
  const [document, setDocument] = useState(client?.document || "");
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">(
    client?.documentType || "cpf"
  );
  const [type, setType] = useState<"residential" | "commercial">(
    client?.type || "residential"
  );
  const [status, setStatus] = useState<Client["status"]>(
    client?.status || "active"
  );

  // Dados comerciais
  const [companyName, setCompanyName] = useState(client?.companyName || "");
  const [tradeName, setTradeName] = useState(client?.tradeName || "");

  // Endereços
  const [addresses, setAddresses] = useState<Address[]>(
    client?.addresses || [
      {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        isMainAddress: true,
      },
    ]
  );

  // Observações
  const [notes, setNotes] = useState(client?.notes || "");

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
    return phone;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const formatDocument = (value: string, type: "cpf" | "cnpj") => {
    const numbers = value.replace(/\D/g, "");
    if (type === "cpf") {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
        .slice(0, 18);
    }
  };

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        isMainAddress: false,
      },
    ]);
  };

  const handleRemoveAddress = (index: number) => {
    if (addresses.length === 1) {
      setError("É necessário ter pelo menos um endereço");
      return;
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleAddressChange = (
    index: number,
    field: keyof Address,
    value: any
  ) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  const validateForm = (): boolean => {
    setError("");

    if (!name || !email || !phone || !document) {
      setError("Preencha todos os campos obrigatórios");
      return false;
    }

    if (!clientService.validateEmail(email)) {
      setError("E-mail inválido");
      return false;
    }

    if (!clientService.validatePhone(phone)) {
      setError("Telefone inválido");
      return false;
    }

    if (!clientService.validateDocument(document, documentType)) {
      setError(`${documentType.toUpperCase()} inválido`);
      return false;
    }

    const mainAddress = addresses[0];
    if (
      !mainAddress.street ||
      !mainAddress.number ||
      !mainAddress.city ||
      !mainAddress.state ||
      !mainAddress.zipCode
    ) {
      setError("Preencha o endereço principal");
      return false;
    }

    if (documentType === "cnpj" && !companyName) {
      setError("Razão social é obrigatória para pessoa jurídica");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const clientData: CreateClientData = {
        name,
        email,
        phone,
        alternativePhone: alternativePhone || undefined,
        document,
        documentType,
        type,
        status,
        addresses,
        notes: notes || undefined,
        companyName: companyName || undefined,
        tradeName: tradeName || undefined,
        createdBy,
      };

      if (isEditing) {
        await clientService.updateClient(client.id, clientData);
      } else {
        await clientService.createClient(clientData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error">
              <span>{error}</span>
            </div>
          )}

          {/* Dados Básicos */}
          <div className="form-section">
            <h3>Dados Básicos</h3>
            <div className="form-row">
              <div className="form-group full">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone Alternativo</label>
                <input
                  type="tel"
                  value={alternativePhone}
                  onChange={(e) =>
                    setAlternativePhone(formatPhone(e.target.value))
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Documento *</label>
                <select
                  value={documentType}
                  onChange={(e) => {
                    setDocumentType(e.target.value as "cpf" | "cnpj");
                    setDocument("");
                  }}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>
              <div className="form-group">
                <label>{documentType.toUpperCase()} *</label>
                <input
                  type="text"
                  value={document}
                  onChange={(e) =>
                    setDocument(formatDocument(e.target.value, documentType))
                  }
                  placeholder={
                    documentType === "cpf"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo de Cliente *</label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "residential" | "commercial")
                  }
                >
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Client["status"])
                  }
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>

            {documentType === "cnpj" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Razão Social *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Razão social da empresa"
                    required={documentType === "cnpj"}
                  />
                </div>
                <div className="form-group">
                  <label>Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Nome fantasia"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Endereços */}
          <div className="form-section">
            <div className="section-header">
              <h3>Endereços</h3>
              <button
                type="button"
                className="btn-add"
                onClick={handleAddAddress}
              >
                <Plus size={16} />
                Adicionar Endereço
              </button>
            </div>

            {addresses.map((address, index) => (
              <div key={index} className="address-card">
                <div className="address-header">
                  <span className="address-title">
                    {address.isMainAddress
                      ? "Endereço Principal"
                      : `Endereço ${index + 1}`}
                  </span>
                  {!address.isMainAddress && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveAddress(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CEP *</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) =>
                        handleAddressChange(
                          index,
                          "zipCode",
                          formatCEP(e.target.value)
                        )
                      }
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="form-group wide">
                    <label>Rua *</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) =>
                        handleAddressChange(index, "street", e.target.value)
                      }
                      placeholder="Nome da rua"
                      required
                    />
                  </div>
                  <div className="form-group small">
                    <label>Número *</label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) =>
                        handleAddressChange(index, "number", e.target.value)
                      }
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Complemento</label>
                    <input
                      type="text"
                      value={address.complement}
                      onChange={(e) =>
                        handleAddressChange(index, "complement", e.target.value)
                      }
                      placeholder="Apto, Bloco, etc"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bairro *</label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={(e) =>
                        handleAddressChange(
                          index,
                          "neighborhood",
                          e.target.value
                        )
                      }
                      placeholder="Nome do bairro"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cidade *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) =>
                        handleAddressChange(index, "city", e.target.value)
                      }
                      placeholder="Nome da cidade"
                      required
                    />
                  </div>
                  <div className="form-group small">
                    <label>UF *</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) =>
                        handleAddressChange(
                          index,
                          "state",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Observações */}
          <div className="form-section">
            <h3>Observações</h3>
            <div className="form-group full">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informações adicionais sobre o cliente..."
                rows={4}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? "Atualizar" : "Cadastrar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
