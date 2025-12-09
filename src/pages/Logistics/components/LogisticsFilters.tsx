import { useState } from "react";
import type { DispatchFilters } from "../../../types/logistics";
import {
  DISPATCH_STATUS_LABELS,
  DISPATCH_PRIORITY_LABELS,
  TRANSPORT_TYPE_LABELS,
} from "../../../types/logistics";
import { Search, Filter } from "lucide-react";
import "./LogisticsFilters.css";

interface LogisticsFiltersProps {
  onFilterChange: (filters: DispatchFilters) => void;
}

export function LogisticsFilters({ onFilterChange }: LogisticsFiltersProps) {
  const [filters, setFilters] = useState<DispatchFilters>({});

  const handleFilterChange = (
    field: keyof DispatchFilters,
    value: string | undefined
  ) => {
    const newFilters = { ...filters, [field]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="logistics-filters">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <h3>Filtros</h3>
        </div>
        <button className="btn-clear" onClick={handleClearFilters}>
          Limpar Filtros
        </button>
      </div>

      <div className="filters-content">
        <div className="filter-group">
          <label>
            <Search size={16} />
            Buscar
          </label>
          <input
            type="text"
            placeholder="Cliente, código, técnico..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(DISPATCH_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Prioridade</label>
          <select
            value={filters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">Todas</option>
            {Object.entries(DISPATCH_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Transporte</label>
          <select
            value={filters.transportType || ""}
            onChange={(e) => handleFilterChange("transportType", e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(TRANSPORT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

