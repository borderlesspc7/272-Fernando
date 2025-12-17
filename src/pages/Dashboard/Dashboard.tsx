import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Users, AlertCircle, Package, Plus } from 'lucide-react';
import { salesService } from '../../services/salesService';
import { installationsService } from '../../services/installationsService';
import { occurrencesService } from '../../services/occurrencesService';
import { stockService } from '../../services/stockService';
import { paths } from '../../routes/paths';
import DashboardStats from './components/DashboardStats';
import DashboardQuickActions from './components/DashboardQuickActions';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: {
      inProgress: 0,
      completed: 0,
    },
    installations: {
      pending: 0,
    },
    occurrences: {
      open: 0,
    },
    stock: {
      totalItems: 0,
    },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [salesStats, installationsStats, occurrencesStats, stockStats] = await Promise.all([
        salesService.getSaleStats(),
        installationsService.getStats(),
        occurrencesService.getStats(),
        stockService.getStats(),
      ]);

      setStats({
        sales: {
          inProgress: salesStats.inProgress,
          completed: salesStats.active,
        },
        installations: {
          pending: installationsStats.pending,
        },
        occurrences: {
          open: occurrencesStats.open,
        },
        stock: {
          totalItems: stockStats.totalItems,
        },
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    navigate(paths.sales);
    // Trigger new sale modal - this would need to be handled by the Sales component
    // For now, just navigate to sales page
  };

  const handleNewClient = () => {
    navigate(paths.clients);
    // Trigger new client modal - this would need to be handled by the Clients component
  };

  const handleNewOccurrence = () => {
    navigate(paths.occurrences);
    // Trigger new occurrence modal - this would need to be handled by the Occurrences component
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-description">Visão geral do sistema</p>
        </div>
      </div>

      <DashboardStats stats={stats} />
      <DashboardQuickActions
        onNewSale={handleNewSale}
        onNewClient={handleNewClient}
        onNewOccurrence={handleNewOccurrence}
      />
    </div>
  );
}

