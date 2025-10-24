import { useState } from "react";
import type { ClientFilters as Filters } from "../../../types/clients";
import { Search, Filter, X } from "lucide-react";
import "./ClientFilters.css";

interface ClientFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export function ClientFilters({ onFilterChange }: ClientFiltersProps) {
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
            placeholder="Buscar por nome, email, telefone ou documento..."
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
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="blocked">Bloqueados</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo</label>
            <select
              value={filters.type || ""}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="residential">Residencial</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Plano Ativo</label>
            <select
              value={
                filters.hasActivePlan === undefined
                  ? ""
                  : filters.hasActivePlan
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                handleFilterChange(
                  "hasActivePlan",
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
            >
              <option value="">Todos</option>
              <option value="true">Com Plano</option>
              <option value="false">Sem Plano</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
