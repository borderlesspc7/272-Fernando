import { useState } from "react";
import type { StockFilters as Filters } from "../../../types/stock";
import { Search, Filter, X } from "lucide-react";
import { CATEGORY_LABELS } from "../../../types/stock";
import "../../Clients/components/ClientFilters.css";

interface StockFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export function StockFilters({ onFilterChange }: StockFiltersProps) {
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
    value: string | boolean | undefined
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
            placeholder="Buscar por nome, modelo ou fabricante..."
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
            <label>Categoria</label>
            <select
              value={filters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">Todas</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="available">Disponível</option>
              <option value="reserved">Reservado</option>
              <option value="separated">Separado</option>
              <option value="dispatched">Despachado</option>
              <option value="in_maintenance">Em Manutenção</option>
              <option value="defective">Defeituoso</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Estoque Baixo</label>
            <input
              type="checkbox"
              checked={filters.lowStock || false}
              onChange={(e) => handleFilterChange("lowStock", e.target.checked)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
