import { useEffect, useState } from "react";
import { billingService } from "../../services/billingService";
import type { Invoice, InvoiceStatus } from "../../types/billing";
import "./Finance.css";
import { useAuth } from "../../hooks/useAuth";

export function Finance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "open"
  );

  const load = async () => {
    try {
      setLoading(true);
      const data = await billingService.getInvoicesByFilters(
        statusFilter === "all" ? {} : { status: statusFilter }
      );
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await billingService.markAsPaid(invoice.id, {
        paymentMethod: "pix",
        notes: `Baixa manual por ${user?.name || "usuário"}`,
      });
      await load();
    } catch (error) {
      console.error("Erro ao marcar como paga:", error);
      alert("Erro ao marcar fatura como paga");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  };

  return (
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <h1>Financeiro / Cobrança</h1>
          <p className="finance-description">
            Controle simples de faturas (contas a receber) geradas a partir das
            vendas.
          </p>
        </div>

        <div className="finance-filters">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as InvoiceStatus | "all")
            }
          >
            <option value="open">Abertas</option>
            <option value="overdue">Atrasadas</option>
            <option value="paid">Pagas</option>
            <option value="cancelled">Canceladas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="finance-loading">Carregando faturas...</div>
      ) : invoices.length === 0 ? (
        <div className="finance-empty">
          <p>Nenhuma fatura encontrada para o filtro selecionado.</p>
          <span>
            Crie uma venda para gerar automaticamente a primeira fatura.
          </span>
        </div>
      ) : (
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div className="finance-client">
                      <div className="finance-avatar">
                        {inv.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="finance-client-name">{inv.clientName}</p>
                        <p className="finance-client-id">#{inv.clientId}</p>
                      </div>
                    </div>
                  </td>
                  <td>{inv.description}</td>
                  <td>{formatDate(inv.dueDate as Date)}</td>
                  <td className="finance-amount">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td>
                    <span
                      className={`finance-status finance-status-${inv.status}`}
                    >
                      {inv.status === "open" && "Aberta"}
                      {inv.status === "paid" && "Paga"}
                      {inv.status === "overdue" && "Atrasada"}
                      {inv.status === "cancelled" && "Cancelada"}
                    </span>
                  </td>
                  <td>
                    {inv.status === "open" || inv.status === "overdue" ? (
                      <button
                        className="finance-btn-pay"
                        onClick={() => handleMarkPaid(inv)}
                      >
                        Marcar como paga
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

