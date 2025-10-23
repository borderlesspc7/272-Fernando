import { useState, type ReactNode } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarMenuOpen, setIsMobileSidebarMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileMenuClick = () => {
    setIsMobileSidebarMenuOpen(!isMobileSidebarMenuOpen);
  };

  return (
    <div className="layout">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      <div
        className={`layout-main ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Header onMenuClick={handleMobileMenuClick} />

        <main className="layout-content">{children}</main>
      </div>

      {isMobileSidebarMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileSidebarMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
