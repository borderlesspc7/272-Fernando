import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { salesService } from "../../../services/salesService";
import { clientService } from "../../../services/clientsService";
import { installationsService } from "../../../services/installationsService";
import { SkeletonChart } from "../../../components/ui/Skeleton";
import "./DashboardCharts.css";

interface SalesData {
  month: string;
  vendas: number;
  receita: number;
}

interface InstallationsData {
  name: string;
  value: number;
}

interface ClientsData {
  name: string;
  value: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [installationsData, setInstallationsData] = useState<InstallationsData[]>([]);
  const [clientsData, setClientsData] = useState<ClientsData[]>([]);

  useEffect(() => {
    loadChartsData();
  }, []);

  const loadChartsData = async () => {
    try {
      setLoading(true);

      // Dados de vendas
      const sales = await salesService.getAllSales();
      const salesByMonth = processSalesByMonth(sales);
      setSalesData(salesByMonth);

      // Dados de instalações
      const installations = await installationsService.getAllInstallations();
      const installationsByStatus = processInstallationsByStatus(installations);
      setInstallationsData(installationsByStatus);

      // Dados de clientes
      const clients = await clientService.getAllClients();
      const clientsByType = processClientsByType(clients);
      setClientsData(clientsByType);
    } catch (error) {
      console.error("Erro ao carregar dados dos gráficos:", error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesByMonth = (sales: any[]) => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const monthsData: { [key: string]: { vendas: number; receita: number } } = {};

    months.forEach((month) => {
      monthsData[month] = { vendas: 0, receita: 0 };
    });

    sales.forEach((sale) => {
      const date = sale.saleDate instanceof Date ? sale.saleDate : new Date();
      const monthIndex = date.getMonth();
      if (monthIndex < 6) {
        const monthName = months[monthIndex];
        monthsData[monthName].vendas += 1;
        monthsData[monthName].receita += sale.payment?.totalValue || 0;
      }
    });

    return months.map((month) => ({
      month,
      vendas: monthsData[month].vendas,
      receita: monthsData[month].receita,
    }));
  };

  const processInstallationsByStatus = (installations: any[]) => {
    const statusMap: { [key: string]: number } = {
      Pendente: 0,
      Agendada: 0,
      "Em Progresso": 0,
      Concluída: 0,
      Cancelada: 0,
    };

    installations.forEach((installation) => {
      switch (installation.status) {
        case "pending":
          statusMap["Pendente"]++;
          break;
        case "scheduled":
          statusMap["Agendada"]++;
          break;
        case "in_progress":
          statusMap["Em Progresso"]++;
          break;
        case "completed":
          statusMap["Concluída"]++;
          break;
        case "cancelled":
          statusMap["Cancelada"]++;
          break;
      }
    });

    return Object.entries(statusMap)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  };

  const processClientsByType = (clients: any[]) => {
    const typeMap: { [key: string]: number } = {
      Residencial: 0,
      Comercial: 0,
    };

    clients.forEach((client) => {
      if (client.type === "residential") {
        typeMap["Residencial"]++;
      } else if (client.type === "commercial") {
        typeMap["Comercial"]++;
      }
    });

    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="dashboard-charts">
        <SkeletonChart />
        <div className="charts-row">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-charts">
      {/* Gráfico de Vendas por Mês */}
      <div className="chart-container">
        <h3>Vendas e Receita por Mês</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="vendas"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Vendas"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="receita"
              stroke="#10b981"
              strokeWidth={2}
              name="Receita (R$)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-row">
        {/* Gráfico de Instalações por Status */}
        <div className="chart-container">
          <h3>Status das Instalações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                data={installationsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {installationsData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Clientes por Tipo */}
        <div className="chart-container">
          <h3>Clientes por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
