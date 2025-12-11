import { useEffect, useState } from "react";
import { installationsService } from "../../services/installationsService";
import { useAuth } from "../../hooks/useAuth";
import type {
  Installation,
  InstallationFilters,
} from "../../types/installations";
import { InstallationsFilters } from "./components/InstallationsFilters";
import { InstallationsList } from "./components/InstallationsList";
import { InstallationDetailModal } from "./components/InstallationDetailModal";
import "./Installations.css";

export function Installations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [filtered, setFiltered] = useState<Installation[]>([]);
  const [selected, setSelected] = useState<Installation | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await installationsService.getAllInstallations();
    setInstallations(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onFilter = (f: InstallationFilters) => {
    let list = [...installations];
    if (f.status) list = list.filter((i) => i.status === f.status);
    if (f.technicianId)
      list = list.filter((i) => i.technicianId === f.technicianId);
    if (f.search) {
      const term = f.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.clientName.toLowerCase().includes(term) ||
          i.technicianName?.toLowerCase().includes(term)
      );
    }

    if (f.dateFrom) {
      const dateFrom = f.dateFrom;
      list = list.filter((i) => {
        const schedDate = i.scheduledDate as Date;
        return schedDate >= dateFrom;
      });
    }
    if (f.dateTo) {
      const dateTo = f.dateTo;
      list = list.filter((i) => {
        const schedDate = i.scheduledDate as Date;
        return schedDate <= dateTo;
      });
    }

    setFiltered(list);
  };

  const openDetail = (inst: Installation) => {
    setSelected(inst);
    setShowModal(true);
  };

  const closeDetail = () => {
    setShowModal(false);
    setSelected(null);
  };

  const refresh = () => load();

  return (
    <div className="installations-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Instalações</h1>
          <p className="page-description">Acompanhe agendamentos e conclusão</p>
        </div>
      </div>

      <InstallationsFilters onFilterChange={onFilter} />

      {loading ? (
        <div className="loading-container">
          <div className="spinner-large" />
          <p>Carregando instalações...</p>
        </div>
      ) : (
        <InstallationsList installations={filtered} onViewDetail={openDetail} />
      )}

      {showModal && selected && (
        <InstallationDetailModal
          installation={selected}
          onClose={closeDetail}
          onSuccess={refresh}
          userId={user?.uid || ""}
        />
      )}
    </div>
  );
}
