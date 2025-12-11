import { useState } from "react";
import type { InstallationFilters } from "../../../types/installations";
import { INSTALLATION_STATUS_LABELS } from "../../../types/installations";
import { Search, Filter } from "lucide-react";
import "./InstallationsFilters.css";

interface Props {
  onFilterChange: (filters: InstallationFilters) => void;
}

export function InstallationsFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<InstallationFilters>({});

  const update = (
    field: keyof InstallationFilters,
    value: string | Date | undefined
  ) => {
    const next = { ...filters, [field]: value || undefined };
    setFilters(next);
    onFilterChange(next);
  };

  const clear = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="installations-filters">
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
            placeholder="Cliente ou tecnico..."
            value={filters.search || ""}
            onChange={(e) => update("search", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status || ""}
            onChange={(e) => update("status", e.target.value || undefined)}
          >
            <option value="">Todos</option>
            {Object.entries(INSTALLATION_STATUS_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
