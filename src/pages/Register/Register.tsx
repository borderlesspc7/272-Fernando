import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { paths } from "../../routes/paths";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./Register.css";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Todos os campos obrigatórios devem ser preenchidos");
      return false;
    }

    if (password.length < 6) {
      setLocalError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError("As senhas não coincidem");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("E-mail inválido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        role: "user",
      });

      setSuccessMessage("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => {
        navigate(paths.login);
      }, 2000);
    } catch (err) {
      console.error("Erro no registro:", err);
    }
  };

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

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };

  const displayError = localError || error;

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="register-content">
        <div className="register-card">
          <div className="register-header">
            <div className="logo-container">
              <div className="logo-icon">
                <CheckSquare size={40} strokeWidth={2.5} />
              </div>
              <h1>Criar Conta</h1>
            </div>
            <p className="register-subtitle">
              Preencha os dados para criar sua conta
            </p>
          </div>

          {displayError && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{displayError}</span>
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              <CheckCircle2 size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="name">
                Nome completo <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                E-mail <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone (opcional)</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={20} />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Senha <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirmar senha <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <CheckSquare className="input-icon" size={20} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="password-requirements">
              <p className="requirements-title">Requisitos da senha:</p>
              <ul>
                <li className={password.length >= 6 ? "valid" : ""}>
                  Mínimo de 6 caracteres
                </li>
                <li
                  className={
                    password === confirmPassword && password ? "valid" : ""
                  }
                >
                  As senhas devem coincidir
                </li>
              </ul>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Já tem uma conta?{" "}
              <Link to={paths.login} className="link">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
