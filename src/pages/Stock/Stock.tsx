import { useState, useEffect } from "react";
import { StockStats } from "./components/StockStats";
import { StockFilters } from "./components/StockFilters";
import { StockList } from "./components/StockList";
import { SeparationOrdersList } from "./components/SeparationOrdersList";
import { StockItemModal } from "./components/StockItemModal";
import { StockEntryModal } from "./components/StockEntryModal";
import { StockDispatchModal } from "./components/StockDispatchModal";
import { StockDetailModal } from "./components/StockDetailModal";
import { stockService } from "../../services/stockService";
import { useAuth } from "../../hooks/useAuth";
import type {
  StockItem,
  SeparationOrder,
  StockFilters as Filters,
  StockStats as Stats,
} from "../../types/stock";
import { Plus, Download, Upload, Send, Package } from "lucide-react";
import "./Stock.css";

export function Stock() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"items" | "orders">("items");
  const [items, setItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [separationOrders, setSeparationOrders] = useState<SeparationOrder[]>(
    []
  );
  const [stats, setStats] = useState<Stats | null>(null);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, ordersData, statsData] = await Promise.all([
        stockService.getAllItems(),
        stockService.getSeparationOrders(),
        stockService.getStats(),
      ]);
      setItems(itemsData);
      setFilteredItems(itemsData);
      setSeparationOrders(ordersData.filter((o) => o.status !== "dispatched"));
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

  const handleFilterChange = async (filters: Filters) => {
    try {
      if (Object.keys(filters).length === 0) {
        setFilteredItems(items);
      } else {
        const filtered = await stockService.getItemsByFilters(filters);
        setFilteredItems(filtered);
      }
    } catch (error) {
      console.error("Erro ao filtrar:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      await stockService.deleteItem(itemId);
      loadData();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      alert("Não foi possível deletar o item");
    }
  };

  const handleEditItem = (item: StockItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleViewDetail = (item: StockItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleModalSuccess = () => {
    setShowItemModal(false);
    setShowEntryModal(false);
    setShowDispatchModal(false);
    setSelectedItem(null);
    loadData();
  };

  const handleModalClose = () => {
    setShowItemModal(false);
    setShowEntryModal(false);
    setShowDispatchModal(false);
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handleUpdateSeparationStatus = async (
    orderId: string,
    status: SeparationOrder["status"]
  ) => {
    try {
      await stockService.updateSeparationOrderStatus(
        orderId,
        status,
        user?.uid || ""
      );
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Não foi possível atualizar o status");
    }
  };

  return (
    <div className="stock-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Estoque / Almoxarifado</h1>
          <p className="page-description">
            Gerencie equipamentos, entradas e saídas
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowEntryModal(true)}
          >
            <Download size={18} />
            Entrada
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowDispatchModal(true)}
          >
            <Send size={18} />
            Despacho
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setSelectedItem(null);
              setShowItemModal(true);
            }}
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      {stats && <StockStats stats={stats} />}

      {/* Abas */}
      <div className="stock-tabs">
        <button
          className={`stock-tab ${activeTab === "items" ? "active" : ""}`}
          onClick={() => setActiveTab("items")}
        >
          <Package size={18} />
          Itens de Estoque
        </button>
        <button
          className={`stock-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <Package size={18} />
          Ordens de Separação
          {separationOrders.length > 0 && (
            <span className="tab-badge">{separationOrders.length}</span>
          )}
        </button>
      </div>

      {activeTab === "items" && (
        <>
          <StockFilters onFilterChange={handleFilterChange} />

          {loading ? (
            <div className="loading-container">
              <div className="spinner-large"></div>
              <p>Carregando estoque...</p>
            </div>
          ) : (
            <StockList
              items={filteredItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onViewDetail={handleViewDetail}
            />
          )}
        </>
      )}

      {activeTab === "orders" && (
        <>
          {loading ? (
            <div className="loading-container">
              <div className="spinner-large"></div>
              <p>Carregando ordens...</p>
            </div>
          ) : (
            <SeparationOrdersList
              orders={separationOrders}
              onUpdateStatus={handleUpdateSeparationStatus}
            />
          )}
        </>
      )}

      {showItemModal && (
        <StockItemModal
          item={selectedItem}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          createdBy={user?.uid || ""}
        />
      )}

      {showEntryModal && (
        <StockEntryModal
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          createdBy={user?.uid || ""}
        />
      )}

      {showDispatchModal && (
        <StockDispatchModal
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          createdBy={user?.uid || ""}
        />
      )}

      {showDetailModal && selectedItem && (
        <StockDetailModal item={selectedItem} onClose={handleModalClose} />
      )}
    </div>
  );
}
