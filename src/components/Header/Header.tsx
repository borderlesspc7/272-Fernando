import { useState } from "react";
import { Bell, Search, Menu, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Header.css";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const notifications = [
    { id: 1, text: "Nova ordem de serviço atribuída", time: "5 min atrás" },
    { id: 2, text: "Cliente João Silva entrou em contato", time: "1h atrás" },
    { id: 3, text: "Estoque baixo: Equipamento XYZ", time: "2h atrás" },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Menu size={20} />
        </button>

        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar clientes, pedidos, equipamentos..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="header-item notifications">
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {showNotifications && (
            <div className="dropdown notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notificações</h3>
                <button className="mark-read">Marcar como lidas</button>
              </div>
              <ul className="notification-list">
                {notifications.map((notification) => (
                  <li key={notification.id} className="notification-item">
                    <div className="notification-text">{notification.text}</div>
                    <div className="notification-time">{notification.time}</div>
                  </li>
                ))}
              </ul>
              <div className="dropdown-footer">
                <button className="view-all">Ver todas</button>
              </div>
            </div>
          )}
        </div>

        <div className="header-item user-menu">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Usuário"}</span>
              <span className="user-role">
                {user?.role === "admin" ? "Administrador" : "Usuário"}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="dropdown user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar large">
                  <User size={24} />
                </div>
                <div>
                  <p className="user-name-large">{user?.name || "Usuário"}</p>
                  <p className="user-email">
                    {user?.email || "usuario@email.com"}
                  </p>
                </div>
              </div>
              <ul className="dropdown-list">
                <li>
                  <button className="dropdown-item">
                    <User size={20} />
                    <span>Perfil</span>
                  </button>
                </li>
                <li className="divider"></li>
                <li>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Sair</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
