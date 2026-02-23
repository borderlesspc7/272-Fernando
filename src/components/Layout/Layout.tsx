import { useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
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

  // Busca global
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K para abrir busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        <Header 
          onMenuClick={handleMobileMenuClick}
          onSearchClick={() => setIsSearchOpen(true)}
        />

        <main className="layout-content">{children}</main>
      </div>

      {isMobileSidebarMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileSidebarMenuOpen(false)}
        />
      )}

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
}

export default Layout;
