import { useState, useEffect } from "react";
import { techniciansService } from "../../services/techniciansService";
import type { Technician, TechnicianFilters } from "../../types/technicians";
import { TechniciansFilters } from "./components/TechniciansFilters/TechniciansFilters";
import { TechniciansList } from "./components/TechniciansList/TechniciansList";
import { TechnicianModal } from "./components/TechnicianModal/TechnicianModal";
import { Plus } from "lucide-react";
import "./Technicians.css";

export default function Technicians() {
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filtered, setFiltered] = useState<Technician[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const data = await techniciansService.getAllTechnicians();
      setTechnicians(data);
      setFiltered(data);
    } catch (error) {
      console.error("Erro ao carregar técnicos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: TechnicianFilters) => {
    let list = [...technicians];

    if (filters.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.region) {
      list = list.filter((t) => t.region === filters.region);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term) ||
          t.phone.includes(term)
      );
    }

    setFiltered(list);
  };

  const handleNewTechnician = () => {
    setSelectedTechnician(null);
    setShowModal(true);
  };

  const handleEditTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTechnician(null);
    loadTechnicians();
  };

  return (
    <div className="technicians-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Técnicos</h1>
          <p className="page-description">
            Gerencie a equipe técnica e suas atribuições
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleNewTechnician}>
            <Plus size={18} />
            Novo Técnico
          </button>
        </div>
      </div>

      <TechniciansFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading-container">
          <div className="spinner-large" />
          <p>Carregando técnicos...</p>
        </div>
      ) : (
        <TechniciansList technicians={filtered} onEdit={handleEditTechnician} />
      )}

      {showModal && (
        <TechnicianModal
          technician={selectedTechnician}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      )}
    </div>
  );
}
