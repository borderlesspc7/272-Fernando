import type { DispatchStats } from "../../../types/logistics";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import "./LogisticsStats.css";

interface LogisticsStatsProps {
  stats: DispatchStats;
}

export function LogisticsStats({ stats }: LogisticsStatsProps) {
  const statCards = [
    {
      label: "Total de Envios",
      value: stats.total,
      icon: Package,
      color: "blue",
    },
    {
      label: "Aguardando",
      value: stats.pending,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Em Trânsito",
      value: stats.inTransit,
      icon: Truck,
      color: "purple",
    },
    {
      label: "Entregues",
      value: stats.delivered,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Falhas",
      value: stats.failed,
      icon: AlertTriangle,
      color: "red",
    },
    {
      label: "Entrega no Prazo",
      value: `${stats.onTimeDeliveryRate}%`,
      icon: TrendingUp,
      color: "green",
      isPercentage: true,
    },
  ];

  return (
    <div className="logistics-stats">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`logistics-stat-card stat-${card.color}`}
          >
            <div className="logistics-stat-icon">
              <Icon size={24} />
            </div>
            <div className="logistics-stat-content">
              <p className="logistics-stat-label">{card.label}</p>
              <p className="logistics-stat-value">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

