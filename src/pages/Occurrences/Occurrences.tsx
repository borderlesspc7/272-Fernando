import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { occurrencesService } from '../../services/occurrencesService';
import type { Occurrence, OccurrenceFilters, OccurrenceStats } from '../../types/occurrences';
import OccurrencesStats from './components/OccurrencesStats';
import OccurrencesFilters from './components/OccurrencesFilters';
import OccurrencesList from './components/OccurrencesList';
import OccurrenceDetailModal from './components/OccurrenceDetailModal';
import NewOccurrenceModal from './components/NewOccurrenceModal';
import './Occurrences.css';

export default function Occurrences() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filteredOccurrences, setFilteredOccurrences] = useState<Occurrence[]>([]);
  const [stats, setStats] = useState<OccurrenceStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [occurrencesData, statsData] = await Promise.all([
        occurrencesService.getAllOccurrences(),
        occurrencesService.getStats(),
      ]);
      setOccurrences(occurrencesData);
      setFilteredOccurrences(occurrencesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading occurrences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: OccurrenceFilters) => {
    let filtered = [...occurrences];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((o) => filters.status!.includes(o.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((o) => filters.priority!.includes(o.priority));
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((o) => filters.type!.includes(o.type));
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.title.toLowerCase().includes(term) ||
          o.clientName.toLowerCase().includes(term) ||
          o.description.toLowerCase().includes(term)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((o) => o.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((o) => o.createdAt <= filters.dateTo!);
    }

    setFilteredOccurrences(filtered);
  };

  const handleViewDetails = (occurrence: Occurrence) => {
    setSelectedOccurrence(occurrence);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOccurrence(null);
  };

  const handleOccurrenceUpdated = () => {
    loadData();
    handleCloseDetailModal();
  };

  const handleNewOccurrence = () => {
    setShowNewModal(true);
  };

  const handleCloseNewModal = () => {
    setShowNewModal(false);
  };

  const handleOccurrenceCreated = () => {
    loadData();
    handleCloseNewModal();
  };

  if (loading) {
    return (
      <div className="occurrences-page">
        <div className="occurrences-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="occurrences-page">
      <div className="occurrences-header">
        <div>
          <h1>Ocorrências / Manutenções</h1>
          <p className="occurrences-description">
            Gerencie e acompanhe todas as ocorrências e solicitações de manutenção
          </p>
        </div>
        <button className="occurrences-new-btn" onClick={handleNewOccurrence}>
          <Plus size={20} />
          Nova Ocorrência
        </button>
      </div>

      <OccurrencesStats stats={stats} />
      <OccurrencesFilters onFilter={handleFilterChange} />
      <OccurrencesList occurrences={filteredOccurrences} onViewDetails={handleViewDetails} />

      {showDetailModal && selectedOccurrence && (
        <OccurrenceDetailModal
          occurrence={selectedOccurrence}
          onClose={handleCloseDetailModal}
          onUpdate={handleOccurrenceUpdated}
        />
      )}

      {showNewModal && (
        <NewOccurrenceModal onClose={handleCloseNewModal} onCreate={handleOccurrenceCreated} />
      )}
    </div>
  );
}

