import { useState, type ReactNode } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Estado real (persistente)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estado temporário (hover – só desktop)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Mobile
  const [isMobileSidebarMenuOpen, setIsMobileSidebarMenuOpen] =
    useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleMobileMenuClick = () => {
    setIsMobileSidebarMenuOpen((prev) => !prev);
  };

  // Sidebar visualmente expandida se:
  // - não estiver colapsada
  // - OU estiver em hover
  const isSidebarExpanded = !isSidebarCollapsed || isSidebarHovered;

  return (
    <div className="layout">
      <Sidebar
        isCollapsed={!isSidebarExpanded}
        onToggle={handleToggleSidebar}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      />

      <div
        className={`layout-main ${
          !isSidebarExpanded ? "sidebar-collapsed" : ""
        }`}
      >
        <Header onMenuClick={handleMobileMenuClick} />

        <main className="layout-content">{children}</main>
      </div>

      {isMobileSidebarMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileSidebarMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;
