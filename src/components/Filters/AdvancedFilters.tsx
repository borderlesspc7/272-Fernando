import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import "./AdvancedFilters.css";

export interface FilterOption {
  id: string;
  label: string;
  type: "select" | "date" | "dateRange" | "number" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export default function AdvancedFilters({
  filters,
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterChange = (id: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleApply = () => {
    const activeFilters = Object.entries(filterValues).filter(
      ([_, value]) => value !== "" && value !== undefined && value !== null
    );
    
    setActiveFiltersCount(activeFilters.length);
    onApplyFilters(
      Object.fromEntries(activeFilters)
    );
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilterValues({});
    setActiveFiltersCount(0);
    onClearFilters();
    setIsOpen(false);
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = filterValues[filter.id] || "";

    switch (filter.type) {
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-input"
          >
            <option value="">Todos</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-input"
          />
        );

      case "dateRange":
        return (
          <div className="date-range">
            <input
              type="date"
              value={filterValues[`${filter.id}_start`] || ""}
              onChange={(e) =>
                handleFilterChange(`${filter.id}_start`, e.target.value)
              }
              placeholder="De"
              className="filter-input"
            />
            <span>até</span>
            <input
              type="date"
              value={filterValues[`${filter.id}_end`] || ""}
              onChange={(e) =>
                handleFilterChange(`${filter.id}_end`, e.target.value)
              }
              placeholder="Até"
              className="filter-input"
            />
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className="filter-input"
          />
        );

      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className="filter-input"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="advanced-filters">
      <button
        className={`filters-toggle-btn ${activeFiltersCount > 0 ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="filters-badge">{activeFiltersCount}</span>
        )}
        <ChevronDown
          size={16}
          className={`chevron ${isOpen ? "open" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filtros Avançados</h3>
            <button className="filters-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="filters-grid">
            {filters.map((filter) => (
              <div key={filter.id} className="filter-item">
                <label className="filter-label">{filter.label}</label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="filters-actions">
            <button className="btn-secondary" onClick={handleClear}>
              Limpar
            </button>
            <button className="btn-primary" onClick={handleApply}>
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
