import { useContext, useState } from "react";
import { Modal } from "../components/Modal/Modal";
import { AuthContext } from "../contexts/AuthContext";
import "./ChangePasswordModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ isOpen, onClose }: Props) {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { changePassword } = auth;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validateNewPassword(password: string): string | null {
    if (password.length < 6) {
      return "A senha deve ter no mínimo 6 caracteres.";
    }

    if (!/[A-Z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra MAIÚSCULA.";
    }

    if (!/[a-z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra minúscula.";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setError(null);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha.");
      setSuccess(false);
    }
  }

  return (
    <Modal title="Alterar senha" isOpen={isOpen} onClose={onClose}>
      <form className="change-password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Senha atual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirmar nova senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success">Senha alterada com sucesso!</p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
