import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Wrench,
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/clientes",
      icon: Users,
      label: "Clientes",
    },
    {
      path: "/vendas",
      icon: ShoppingCart,
      label: "Vendas",
    },
    {
      path: "/estoque",
      icon: Package,
      label: "Estoque",
    },
    {
      path: "/ordens-servico",
      icon: Wrench,
      label: "Ordens de Serviço",
    },
    {
      path: "/ocorrencias",
      icon: AlertCircle,
      label: "Ocorrências",
    },
    {
      path: "/relatorios",
      icon: BarChart3,
      label: "Relatórios",
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <CheckSquare size={24} strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="logo-text">Sistema Gestão</span>}
        </div>
        <button className="toggle-button" onClick={onToggle}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-divider"></div>
        {!isCollapsed && (
          <div className="footer-info">
            <p className="version">Versão 1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}
