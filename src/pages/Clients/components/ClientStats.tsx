import type { ClientStats as Stats } from "../../../types/clients";
import { Users, UserCheck, UserX, Clock, Building2, Home } from "lucide-react";
import "./ClientStats.css";

interface ClientStatsProps {
  stats: Stats;
}

export function ClientStats({ stats }: ClientStatsProps) {
  const statCards = [
    {
      label: "Total de Clientes",
      value: stats.total,
      icon: Users,
      color: "blue",
    },
    {
      label: "Clientes Ativos",
      value: stats.active,
      icon: UserCheck,
      color: "green",
    },
    {
      label: "Residenciais",
      value: stats.residential,
      icon: Home,
      color: "orange",
    },
    {
      label: "Comerciais",
      value: stats.commercial,
      icon: Building2,
      color: "cyan",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Inativos",
      value: stats.inactive,
      icon: UserX,
      color: "gray",
    },
    {
      label: "Bloqueados",
      value: stats.blocked,
      icon: UserX,
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
              <p className="stat-value">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
