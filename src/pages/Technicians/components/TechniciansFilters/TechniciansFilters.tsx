import { useState } from "react";
import type { TechnicianFilters } from "../../../../types/technicians";
import {
  TECHNICIAN_STATUS_LABELS,
  TECHNICIAN_REGION_LABELS,
} from "../../../../types/technicians";
import { Search, Filter } from "lucide-react";
import "./TechniciansFilters.css";

interface Props {
  onFilterChange: (filters: TechnicianFilters) => void;
}

export function TechniciansFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<TechnicianFilters>({});

  const update = (field: keyof TechnicianFilters, value: string) => {
    const next = { ...filters, [field]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const clear = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="technicians-filters">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <h3>Filtros</h3>
        </div>
        <button className="btn-clear" onClick={clear}>
          Limpar
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
            placeholder="Nome, email, telefone..."
            value={filters.search || ""}
            onChange={(e) => update("search", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status || ""}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(TECHNICIAN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Região</label>
          <select
            value={filters.region || ""}
            onChange={(e) => update("region", e.target.value)}
          >
            <option value="">Todas</option>
            {Object.entries(TECHNICIAN_REGION_LABELS).map(([value, label]) => (
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
