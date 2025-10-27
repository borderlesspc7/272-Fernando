import { useState } from "react";
import type { SaleFilters as Filters } from "../../../types/sales";
import { Search, Filter, X } from "lucide-react";
import "./SaleFilters.css";

interface SaleFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export function SaleFilters({ onFilterChange }: SaleFiltersProps) {
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const newFilters = { ...filters, search: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFilterChange = (
    key: keyof Filters,
    value: string | undefined
  ) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof Filters] !== undefined
  );

  return (
    <div className="client-filters">
      <div className="filters-main">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente, plano ou ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          {search && (
            <button
              className="clear-search"
              onClick={() => handleSearchChange("")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          className={`filter-toggle ${showAdvanced ? "active" : ""}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={20} />
          Filtros
        </button>

        {hasActiveFilters && (
          <button className="clear-filters" onClick={handleClearFilters}>
            <X size={18} />
            Limpar
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="filters-advanced">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="in_progress">Em Andamento</option>
              <option value="stock_separated">Estoque Separado</option>
              <option value="dispatched">Despachado</option>
              <option value="installing">Instalando</option>
              <option value="active">Ativo</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status Pagamento</label>
            <select
              value={filters.paymentStatus || ""}
              onChange={(e) =>
                handleFilterChange("paymentStatus", e.target.value)
              }
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Atrasado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
