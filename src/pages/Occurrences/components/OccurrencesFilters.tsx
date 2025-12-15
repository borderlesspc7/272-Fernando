import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { OccurrenceFilters, OccurrenceStatus, OccurrencePriority, OccurrenceType } from '../../../types/occurrences';
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_PRIORITY_LABELS, OCCURRENCE_TYPE_LABELS } from '../../../types/occurrences';
import './OccurrencesFilters.css';

interface OccurrencesFiltersProps {
  onFilter: (filters: OccurrenceFilters) => void;
}

export default function OccurrencesFilters({ onFilter }: OccurrencesFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<OccurrenceStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<OccurrencePriority[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<OccurrenceType[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters({ searchTerm: value });
  };

  const handleStatusChange = (status: OccurrenceStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    applyFilters({ status: newStatuses });
  };

  const handlePriorityChange = (priority: OccurrencePriority) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];
    setSelectedPriorities(newPriorities);
    applyFilters({ priority: newPriorities });
  };

  const handleTypeChange = (type: OccurrenceType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    applyFilters({ type: newTypes });
  };

  const applyFilters = (updates: Partial<OccurrenceFilters>) => {
    onFilter({
      searchTerm,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      ...updates,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedTypes([]);
    onFilter({});
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedTypes.length > 0;

  return (
    <div className="occurrences-filters">
      <div className="occurrences-filters-main">
        <div className="occurrences-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por título, cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button
          className={`occurrences-filter-toggle ${showAdvanced ? 'active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={20} />
          Filtros
          {hasActiveFilters && <span className="occurrences-filter-badge">{selectedStatuses.length + selectedPriorities.length + selectedTypes.length}</span>}
        </button>
      </div>

      {showAdvanced && (
        <div className="occurrences-filters-advanced">
          <div className="occurrences-filter-group">
            <label>Status</label>
            <div className="occurrences-filter-options">
              {(Object.keys(OCCURRENCE_STATUS_LABELS) as OccurrenceStatus[]).map((status) => (
                <label key={status} className="occurrences-filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusChange(status)}
                  />
                  <span>{OCCURRENCE_STATUS_LABELS[status]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="occurrences-filter-group">
            <label>Prioridade</label>
            <div className="occurrences-filter-options">
              {(Object.keys(OCCURRENCE_PRIORITY_LABELS) as OccurrencePriority[]).map((priority) => (
                <label key={priority} className="occurrences-filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(priority)}
                    onChange={() => handlePriorityChange(priority)}
                  />
                  <span>{OCCURRENCE_PRIORITY_LABELS[priority]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="occurrences-filter-group">
            <label>Tipo</label>
            <div className="occurrences-filter-options">
              {(Object.keys(OCCURRENCE_TYPE_LABELS) as OccurrenceType[]).map((type) => (
                <label key={type} className="occurrences-filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  <span>{OCCURRENCE_TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button className="occurrences-clear-filters" onClick={clearFilters}>
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

