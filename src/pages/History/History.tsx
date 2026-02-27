import { useState, useEffect } from "react";
import { stockService } from "../../services/stockService";
import { SeparationOrdersList } from "../Stock/components/SeparationOrdersList";
import type { SeparationOrder } from "../../types/stock";
import { History as HistoryIcon } from "lucide-react";
import "./History.css";

export function History() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SeparationOrder[]>([]);

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

      {loading ? (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Carregando histórico...</p>
        </div>
      ) : (
        <SeparationOrdersList orders={orders} onUpdateStatus={() => {}} readOnly />
      )}
    </div>
  );
}
