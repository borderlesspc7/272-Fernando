import { useState, useEffect } from "react";
import { ClientStats } from "./components/ClientStats";
import { ClientsTable } from "./components/ClientsTable";
import { ClientModal } from "./components/ClientModal";
import { ClientFilters } from "./components/ClientFilters";
import { clientService } from "../../services/clientsService";
import { useAuth } from "../../hooks/useAuth";
import type {
  Client,
  ClientFilters as Filters,
  ClientStats as Stats,
} from "../../types/clients";
import { Plus } from "lucide-react";
import "./Clients.css";

export function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filters, setFilters] = useState<Filters>({});

  // Carregar clientes
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await clientService.getClientsByFilters(filters);
        setClients(data);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [filters]);

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await clientService.getClientStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };

    loadStats();
  }, []);

  const handleCreateClient = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    try {
      await clientService.deleteClient(clientId);
      // Recarregar dados
      const [clientsData, statsData] = await Promise.all([
        clientService.getClientsByFilters(filters),
        clientService.getClientStats(),
      ]);
      setClients(clientsData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      alert("Não foi possível deletar o cliente. Tente novamente.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleModalSuccess = async () => {
    // Recarregar dados
    const [clientsData, statsData] = await Promise.all([
      clientService.getClientsByFilters(filters),
      clientService.getClientStats(),
    ]);
    setClients(clientsData);
    setStats(statsData);
    handleModalClose();
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Clientes</h1>
          <p className="page-description">
            Gerencie todos os clientes do sistema
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreateClient}>
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {stats && <ClientStats stats={stats} />}

      <div className="clients-content">
        <ClientFilters onFilterChange={handleFilterChange} />

        <ClientsTable
          clients={clients}
          loading={loading}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      </div>

      {isModalOpen && (
        <ClientModal
          client={selectedClient}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          createdBy={user?.uid || ""}
        />
      )}
    </div>
  );
}
