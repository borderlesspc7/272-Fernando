import { useState, useEffect } from "react";
import { SaleStats } from "./components/SaleStats";
import { SalesTable } from "./components/SalesTable";
import { SaleModal } from "./components/SaleModal";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { SaleFilters } from "./components/SaleFilters";
import { salesService } from "../../services/salesService";
import { useAuth } from "../../hooks/useAuth";
import type {
  Sale,
  SaleFilters as Filters,
  SaleStats as Stats,
} from "../../types/sales";
import { Plus } from "lucide-react";
import "./Sales.css";

export function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  // Carregar vendas
  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await salesService.getSalesByFilters(filters);
        setSales(data);
      } catch (error) {
        console.error("Erro ao carregar vendas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [filters]);

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await salesService.getSaleStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };

    loadStats();
  }, []);

  const handleCreateSale = () => {
    setSelectedSale(null);
    setIsModalOpen(true);
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) {
      return;
    }

    try {
      await salesService.deleteSale(saleId);
      const [salesData, statsData] = await Promise.all([
        salesService.getSalesByFilters(filters),
        salesService.getSaleStats(),
      ]);
      setSales(salesData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao deletar venda:", error);
      alert("Não foi possível deletar a venda. Tente novamente.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedSale(null);
  };

  const handleSuccess = async () => {
    const [salesData, statsData] = await Promise.all([
      salesService.getSalesByFilters(filters),
      salesService.getSaleStats(),
    ]);
    setSales(salesData);
    setStats(statsData);
    handleModalClose();
    handleDetailClose();
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Vendas & Contratos</h1>
          <p className="page-description">
            Gerencie vendas, planos e acompanhe a jornada completa
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreateSale}>
          <Plus size={20} />
          Nova Venda
        </button>
      </div>

      {stats && <SaleStats stats={stats} />}

      <div className="sales-content">
        <SaleFilters onFilterChange={handleFilterChange} />

        <SalesTable
          sales={sales}
          loading={loading}
          onView={handleViewSale}
          onDelete={handleDeleteSale}
        />
      </div>

      {isModalOpen && (
        <SaleModal
          onClose={handleModalClose}
          onSuccess={handleSuccess}
          createdBy={user?.uid || ""}
        />
      )}

      {isDetailOpen && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={handleDetailClose}
          onUpdate={handleSuccess}
        />
      )}
    </div>
  );
}
