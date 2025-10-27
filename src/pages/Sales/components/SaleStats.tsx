import type { SaleStats as Stats } from "../../../types/sales";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Receipt,
  Calendar,
  Zap,
} from "lucide-react";
import "./SaleStats.css";

interface SaleStatsProps {
  stats: Stats;
}

export function SaleStats({ stats }: SaleStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const statCards = [
    {
      label: "Total de Vendas",
      value: stats.total,
      icon: Receipt,
      color: "blue",
    },
    {
      label: "Vendas Ativas",
      value: stats.active,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Em Andamento",
      value: stats.inProgress,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Vendas Pendentes",
      value: stats.pending,
      icon: Zap,
      color: "orange",
    },
    {
      label: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "purple",
      isValue: true,
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(stats.averageTicket),
      icon: TrendingUp,
      color: "cyan",
      isValue: true,
    },
    {
      label: "Vendas Este Mês",
      value: stats.thisMonthSales,
      icon: Calendar,
      color: "indigo",
    },
    {
      label: "Receita do Mês",
      value: formatCurrency(stats.thisMonthRevenue),
      icon: DollarSign,
      color: "green",
      isValue: true,
    },
  ];

  return (
    <div className="sale-stats">
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
