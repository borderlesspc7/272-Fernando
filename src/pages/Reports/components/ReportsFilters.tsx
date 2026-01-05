import { useState } from "react";
import type { ReportFilters } from "../../../types/reports";
import { Filter, Calendar } from "lucide-react";
import "./ReportsFilters.css";

interface Props {
  onFilterChange: (filters: ReportFilters) => void;
}

export function ReportsFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<ReportFilters>({});

  const update = (
    field: keyof ReportFilters,
    value: Date | string | undefined
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
    <div className="reports-filters">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <h3>Filtros de Período</h3>
        </div>
        <button className="btn-clear" onClick={clear}>
          Limpar
        </button>
      </div>

      <div className="filters-content">
        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Data Inicial
          </label>
          <input
            type="date"
            value={
              filters.dateFrom
                ? filters.dateFrom.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              update(
                "dateFrom",
                e.target.value ? new Date(e.target.value) : undefined
              )
            }
          />
        </div>

        <div className="filter-group">
          <label>
            <Calendar size={16} />
            Data final
          </label>
          <input
            type="date"
            value={
              filters.dateTo ? filters.dateTo.toISOString().split("T")[0] : ""
            }
            onChange={(e) =>
              update(
                "dateTo",
                e.target.value ? new Date(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
