import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, User, ShoppingCart, Package, Users } from "lucide-react";
import { clientService } from "../../services/clientsService";
import { salesService } from "../../services/salesService";
import { installationsService } from "../../services/installationsService";
import { techniciansService } from "../../services/techniciansService";
import { TECHNICIAN_REGION_LABELS } from "../../types/technicians";
import { paths } from "../../routes/paths";
import "./GlobalSearch.css";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "client" | "sale" | "installation" | "technician";
  path: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [clients, sales, installations, technicians] = await Promise.all([
        clientService.searchClients(searchTerm),
        salesService.getAllSales(),
        installationsService.getAllInstallations(),
        techniciansService.getAllTechnicians(),
      ]);

      const searchResults: SearchResult[] = [];

      // Clientes
      clients.slice(0, 5).forEach((client) => {
        searchResults.push({
          id: client.id,
          title: client.name,
          subtitle: client.email || client.phone,
          type: "client",
          path: paths.clients,
        });
      });

      // Vendas
      const filteredSales = sales
        .filter(
          (sale) =>
            sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      filteredSales.forEach((sale) => {
        searchResults.push({
          id: sale.id,
          title: `Venda #${sale.id.slice(0, 8)}`,
          subtitle: sale.clientName,
          type: "sale",
          path: paths.sales,
        });
      });

      // Instalações
      const filteredInstallations = installations
        .filter((inst) =>
          inst.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      filteredInstallations.forEach((inst) => {
        searchResults.push({
          id: inst.id,
          title: `Instalação #${inst.id.slice(0, 8)}`,
          subtitle: inst.clientName,
          type: "installation",
          path: paths.installations,
        });
      });

      // Técnicos
      const filteredTechnicians = technicians
        .filter((tech) =>
          tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      filteredTechnicians.forEach((tech) => {
        searchResults.push({
          id: tech.id,
          title: tech.name,
          subtitle: TECHNICIAN_REGION_LABELS[tech.region] || tech.email || tech.phone || "",
          type: "technician",
          path: paths.technicians,
        });
      });

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return <User size={20} />;
      case "sale":
        return <ShoppingCart size={20} />;
      case "installation":
        return <Package size={20} />;
      case "technician":
        return <Users size={20} />;
    }
  };

  const getTypeName = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return "Cliente";
      case "sale":
        return "Venda";
      case "installation":
        return "Instalação";
      case "technician":
        return "Técnico";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-header">
          <Search size={20} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar clientes, vendas, instalações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="global-search-input"
          />
          <button className="search-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="global-search-results">
          {loading && (
            <div className="search-loading">Buscando...</div>
          )}

          {!loading && searchTerm.length >= 2 && results.length === 0 && (
            <div className="search-empty">
              Nenhum resultado encontrado para "{searchTerm}"
            </div>
          )}

          {!loading && searchTerm.length < 2 && searchTerm.length > 0 && (
            <div className="search-hint">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}

          {!loading && searchTerm.length === 0 && (
            <div className="search-hint">
              Digite para começar a buscar ou use Esc para fechar
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="search-results-list">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`search-result-item ${
                    index === selectedIndex ? "selected" : ""
                  }`}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="search-result-icon">{getIcon(result.type)}</div>
                  <div className="search-result-content">
                    <div className="search-result-title">{result.title}</div>
                    <div className="search-result-subtitle">{result.subtitle}</div>
                  </div>
                  <div className="search-result-type">{getTypeName(result.type)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="global-search-footer">
          <div className="search-shortcuts">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navegar</span>
            <span><kbd>Enter</kbd> Selecionar</span>
            <span><kbd>Esc</kbd> Fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
