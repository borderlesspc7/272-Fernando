import { useState, useEffect } from "react";
import { LogisticsStats } from "./components/LogisticsStats";
import { LogisticsFilters } from "./components/LogisticsFilters";
import { LogisticsList } from "./components/LogisticsList";
import { LogisticsDetailModal } from "./components/LogisticsDetailModal";
import { logisticsService } from "../../services/logisticsService";
import { useAuth } from "../../hooks/useAuth";
import type {
  Dispatch,
  DispatchFilters,
  DispatchStats,
} from "../../types/logistics";
import "./Logistics.css";

export function Logistics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<Dispatch[]>([]);
  const [stats, setStats] = useState<DispatchStats | null>(null);

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [dispatchesData, statsData] = await Promise.all([
        logisticsService.getAllDispatches(),
        logisticsService.getStats(),
      ]);
      setDispatches(dispatchesData);
      setFilteredDispatches(dispatchesData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (filters: DispatchFilters) => {
    let filtered = [...dispatches];

    if (filters.status) {
      filtered = filtered.filter((d) => d.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((d) => d.priority === filters.priority);
    }

    if (filters.transportType) {
      filtered = filtered.filter(
        (d) => d.transportType === filters.transportType
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.clientName.toLowerCase().includes(searchLower) ||
          d.trackingCode?.toLowerCase().includes(searchLower) ||
          d.technicianName?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      const dateFrom = filters.dateFrom;
      filtered = filtered.filter((d) => {
        const dispatchDate = d.dispatchDate as Date;
        return dispatchDate >= dateFrom;
      });
    }

    if (filters.dateTo) {
      const dateTo = filters.dateTo;
      filtered = filtered.filter((d) => {
        const dispatchDate = d.dispatchDate as Date;
        return dispatchDate <= dateTo;
      });
    }

    setFilteredDispatches(filtered);
  };

  const handleViewDetail = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedDispatch(null);
  };

  const handleModalSuccess = () => {
    setShowDetailModal(false);
    setSelectedDispatch(null);
    loadData();
  };

  return (
    <div className="logistics-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Despacho / Logística</h1>
          <p className="page-description">
            Acompanhe envios e entregas aos clientes
          </p>
        </div>
      </div>

      {stats && <LogisticsStats stats={stats} />}

      <LogisticsFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Carregando despachos...</p>
        </div>
      ) : (
        <LogisticsList
          dispatches={filteredDispatches}
          onViewDetail={handleViewDetail}
        />
      )}

      {showDetailModal && selectedDispatch && (
        <LogisticsDetailModal
          dispatch={selectedDispatch}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          userId={user?.uid || ""}
        />
      )}
    </div>
  );
}
