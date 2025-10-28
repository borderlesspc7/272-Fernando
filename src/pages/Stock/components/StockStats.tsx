import type { StockStats as Stats } from "../../../types/stock";
import {
  Package,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import "../../Clients/components/ClientStats.css";

interface StockStatsProps {
  stats: Stats;
}

export function StockStats({ stats }: StockStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const statCards = [
    {
      label: "Total de Itens",
      value: stats.totalItems,
      icon: Package,
      color: "blue",
    },
    {
      label: "Valor Total",
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: "green",
      isValue: true,
    },
    {
      label: "Ordens Pendentes",
      value: stats.pendingSeparations,
      icon: Clock,
      color: "purple",
    },
    {
      label: "Disponíveis",
      value: stats.availableItems,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Estoque Baixo",
      value: stats.lowStockItems,
      icon: TrendingDown,
      color: "orange",
    },
    {
      label: "Defeituosos",
      value: stats.defectiveItems,
      icon: AlertTriangle,
      color: "red",
    },
  ];

  return (
    <div className="client-stats">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`stat-card stat-${card.color}`}>
            <div className="stat-icon">
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">{card.label}</p>
              <p className={`stat-value ${card.isValue ? "is-currency" : ""}`}>
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
