import { useState, useEffect, useMemo } from "react";
import { stockService } from "../../services/stockService";
import { SeparationOrdersList } from "../Stock/components/SeparationOrdersList";
import type { SeparationOrder } from "../../types/stock";
import { History as HistoryIcon } from "lucide-react";
import "./History.css";

type StatusFilter = "all" | "dispatched" | "cancelled";

export function History() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SeparationOrder[]>([]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [clientSearch, setClientSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getSeparationOrdersHistory();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearFilters = () => {
    setStatusFilter("all");
    setClientSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Cliente
      if (
        clientSearch &&
        !order.clientName.toLowerCase().includes(clientSearch.toLowerCase())
      ) {
        return false;
      }

      const createdAt =
        order.createdAt instanceof Date
          ? order.createdAt
          : new Date(order.createdAt as any);

      // Data inicial
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (createdAt < from) {
          return false;
        }
      }

      // Data final
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);
        if (createdAt > to) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, clientSearch, dateFrom, dateTo]);

  return (
    <div className="history-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <HistoryIcon size={28} />
            Histórico de Ordens
          </h1>
          <p className="page-description">
            Ordens de separação concluídas (despachadas) ou canceladas
          </p>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">Todos</option>
            <option value="dispatched">Despachado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Cliente</label>
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar por cliente"
          />
        </div>

        <div className="filter-group">
          <label>De</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Até</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button type="button" className="btn-secondary" onClick={clearFilters}>
          Limpar
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Carregando histórico...</p>
        </div>
      ) : (
        <SeparationOrdersList
          orders={filteredOrders}
          onUpdateStatus={() => {}}
          readOnly
        />
      )}
    </div>
  );
}
