import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { paths } from "../../routes/paths";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckSquare,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";
import "./Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      navigate(paths.dashboard);
    } catch (err) {
      // Erro já tratado pelo context
      console.error("Erro no login:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <CheckSquare size={40} strokeWidth={2.5} />
              </div>
              <h1>Sistema de Gestão</h1>
            </div>
            <p className="login-subtitle">Faça login para acessar o sistema</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
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
              <label htmlFor="password">Senha</label>
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
                  autoComplete="current-password"
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

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Não tem uma conta?{" "}
              <Link to={paths.register} className="link">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        <div className="login-info">
          <div className="info-card">
            <div className="info-icon">
              <CheckSquare size={24} />
            </div>
            <h3>Gestão Completa</h3>
            <p>Controle total do ciclo de vida dos equipamentos</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <Clock size={24} />
            </div>
            <h3>Tempo Real</h3>
            <p>Acompanhe instalações e manutenções instantaneamente</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <Package size={24} />
            </div>
            <h3>Rastreabilidade</h3>
            <p>Histórico completo de cada equipamento e cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
