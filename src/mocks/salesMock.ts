import type { Sale } from "../types/sales";
import { AVAILABLE_PLANS } from "../types/sales";
import { Timestamp } from "firebase/firestore";

// Mock de vendas com dados realistas
export const mockSales: Sale[] = [
  {
    id: "sale-001",
    clientId: "client-001",
    clientName: "João Silva",
    plan: {
      ...AVAILABLE_PLANS.find((p) => p.id === "plan-replay-gold")!,
      category: "premium",
    },
    contractType: "simplified_adhesion",
    equipments: [
      {
        id: "eq-001",
        name: "Roteador Premium",
        model: "RT-5000",
        type: "router",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-002",
        name: "Conversor Óptico",
        model: "CO-300",
        type: "converter",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-003",
        name: "Câmera 4K",
        model: "CAM-4K-UHD",
        type: "camera",
        quantity: 4,
        status: "installed",
      },
      {
        id: "eq-004",
        name: "Banner Premium",
        model: "BAN-PREMIUM",
        type: "banner",
        quantity: 2,
        status: "installed",
      },
      {
        id: "eq-005",
        name: "Cabo de Rede 10m",
        model: "CAT6",
        type: "cable",
        quantity: 1,
        status: "installed",
      },
    ],
    payment: {
      totalValue: 299.8,
      installationFee: 99.9,
      firstPaymentDate: new Date("2024-01-15"),
      paymentMethod: "credit_card",
      paymentStatus: "paid",
    },
    status: "active",
    progress: 100, // 100% instalado e ativo
    installationAddress: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    saleDate: new Date("2024-01-10"),
    estimatedInstallationDate: new Date("2024-01-15"),
    actualInstallationDate: new Date("2024-01-15"),
    activationDate: new Date("2024-01-15"),
    documents: [
      {
        id: "doc-001",
        name: "Proposta_Joao_Silva.pdf",
        type: "signed_proposal",
        url: "https://mock-storage.com/proposta-joao-silva.pdf",
        uploadedAt: new Date("2024-01-10"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-002",
        name: "Contrato_Joao_Silva.pdf",
        type: "contract",
        url: "https://mock-storage.com/contrato-joao-silva.pdf",
        uploadedAt: new Date("2024-01-12"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-003",
        name: "Comprovante_Pagamento_001.pdf",
        type: "payment_proof",
        url: "https://mock-storage.com/comprovante-001.pdf",
        uploadedAt: new Date("2024-01-15"),
        uploadedBy: "user-001",
      },
    ],
    timeline: [
      {
        id: "event-001",
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: new Date("2024-01-10"),
        createdBy: "user-001",
      },
      {
        id: "event-002",
        status: "in_progress",
        description: "Proposta assinada pelo cliente",
        createdAt: new Date("2024-01-12"),
        createdBy: "user-001",
        notes: "Cliente aprovou proposta e assinou contrato",
      },
      {
        id: "event-003",
        status: "stock_separated",
        description: "Equipamentos separados no estoque",
        createdAt: new Date("2024-01-13"),
        createdBy: "user-002",
      },
      {
        id: "event-004",
        status: "dispatched",
        description: "Equipamentos despachados para instalação",
        createdAt: new Date("2024-01-14"),
        createdBy: "user-002",
      },
      {
        id: "event-005",
        status: "installing",
        description: "Instalação iniciada",
        createdAt: new Date("2024-01-15"),
        createdBy: "tech-001",
      },
      {
        id: "event-006",
        status: "active",
        description: "Instalação concluída e sistema ativado",
        createdAt: new Date("2024-01-15"),
        createdBy: "tech-001",
        notes: "Todos os equipamentos instalados e funcionando perfeitamente",
      },
    ],
    notes: "Cliente muito satisfeito com a instalação.",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "user-001",
  },
  {
    id: "sale-002",
    clientId: "client-004",
    clientName: "Quadra Sports Club",
    plan: {
      ...AVAILABLE_PLANS.find((p) => p.id === "plan-replay-business")!,
      category: "premium",
    },
    contractType: "monthly_advance",
    equipments: [
      {
        id: "eq-006",
        name: "Roteador Empresarial",
        model: "RT-7000",
        type: "router",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-007",
        name: "Conversor Óptico",
        model: "CO-500",
        type: "converter",
        quantity: 2,
        status: "installed",
      },
      {
        id: "eq-008",
        name: "Câmera 4K Pro",
        model: "CAM-4K-PRO",
        type: "camera",
        quantity: 8,
        status: "installed",
        notes: "Com visão noturna e AI",
      },
      {
        id: "eq-009",
        name: "Banner Digital",
        model: "BAN-DIGITAL",
        type: "banner",
        quantity: 4,
        status: "installed",
        notes: "Com telão LED",
      },
      {
        id: "eq-010",
        name: "Sistema Quadra Completo",
        model: "COURT-SYSTEM-PRO",
        type: "court",
        quantity: 1,
        status: "installed",
        notes: "Inclui sensores e iluminação",
      },
      {
        id: "eq-011",
        name: "Cabo de Rede 15m",
        model: "CAT6A",
        type: "cable",
        quantity: 2,
        status: "installed",
      },
    ],
    payment: {
      totalValue: 449.8,
      installationFee: 149.9,
      firstPaymentDate: new Date("2024-01-01"),
      paymentMethod: "bank_transfer",
      paymentStatus: "paid",
    },
    status: "active",
    progress: 100, // 100% instalado e ativo
    installationAddress: {
      street: "Rua dos Esportes",
      number: "2500",
      complement: "",
      neighborhood: "Vila Olímpica",
      city: "São Paulo",
      state: "SP",
      zipCode: "04567-890",
    },
    saleDate: new Date("2023-12-20"),
    estimatedInstallationDate: new Date("2024-01-05"),
    actualInstallationDate: new Date("2024-01-03"),
    activationDate: new Date("2024-01-03"),
    documents: [
      {
        id: "doc-004",
        name: "Proposta_Quadra_Sports.pdf",
        type: "signed_proposal",
        url: "https://mock-storage.com/proposta-quadra-sports.pdf",
        uploadedAt: new Date("2023-12-20"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-005",
        name: "Contrato_Quadra_Sports.pdf",
        type: "contract",
        url: "https://mock-storage.com/contrato-quadra-sports.pdf",
        uploadedAt: new Date("2023-12-22"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-006",
        name: "Documentos_Cliente_Quadra.pdf",
        type: "client_documents",
        url: "https://mock-storage.com/docs-quadra.pdf",
        uploadedAt: new Date("2023-12-25"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-007",
        name: "Fotos_Instalacao_Quadra_01.jpg",
        type: "installation_photo",
        url: "https://mock-storage.com/foto-instalacao-01.jpg",
        uploadedAt: new Date("2024-01-03"),
        uploadedBy: "tech-001",
      },
      {
        id: "doc-008",
        name: "Fotos_Instalacao_Quadra_02.jpg",
        type: "installation_photo",
        url: "https://mock-storage.com/foto-instalacao-02.jpg",
        uploadedAt: new Date("2024-01-03"),
        uploadedBy: "tech-001",
      },
    ],
    timeline: [
      {
        id: "event-007",
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: new Date("2023-12-20"),
        createdBy: "user-001",
      },
      {
        id: "event-008",
        status: "in_progress",
        description: "Contrato assinado e pagamento antecipado realizado",
        createdAt: new Date("2023-12-22"),
        createdBy: "user-001",
        notes: "Cliente optou por antecipação de mensalidade",
      },
      {
        id: "event-009",
        status: "stock_separated",
        description: "Equipamentos separados no estoque",
        createdAt: new Date("2023-12-28"),
        createdBy: "user-002",
      },
      {
        id: "event-010",
        status: "dispatched",
        description: "Equipamentos despachados para instalação",
        createdAt: new Date("2024-01-02"),
        createdBy: "user-002",
      },
      {
        id: "event-011",
        status: "installing",
        description: "Instalação iniciada",
        createdAt: new Date("2024-01-03"),
        createdBy: "tech-002",
      },
      {
        id: "event-012",
        status: "active",
        description: "Sistema instalado e ativado com sucesso",
        createdAt: new Date("2024-01-03"),
        createdBy: "tech-002",
        notes: "Instalação completa: 8 câmeras, 4 banners digitais e sistema de quadra",
      },
    ],
    notes: "Instalação complexa com múltiplos equipamentos. Cliente muito satisfeito.",
    internalNotes: "Sistema de quadra requer manutenção trimestral.",
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2024-01-03"),
    createdBy: "user-001",
  },
  {
    id: "sale-003",
    clientId: "client-002",
    clientName: "Academia Fit Center",
    plan: {
      ...AVAILABLE_PLANS.find((p) => p.id === "plan-replay-silver")!,
      category: "intermediate",
    },
    contractType: "simplified_adhesion",
    equipments: [
      {
        id: "eq-012",
        name: "Roteador Padrão",
        model: "RT-3000",
        type: "router",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-013",
        name: "Conversor Óptico",
        model: "CO-200",
        type: "converter",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-014",
        name: "Câmera Full HD",
        model: "CAM-FHD-1080",
        type: "camera",
        quantity: 2,
        status: "installed",
      },
      {
        id: "eq-015",
        name: "Banner Publicitário",
        model: "BAN-STANDARD",
        type: "banner",
        quantity: 1,
        status: "installed",
      },
    ],
    payment: {
      totalValue: 229.8,
      installationFee: 79.9,
      firstPaymentDate: new Date("2024-02-01"),
      paymentMethod: "bank_transfer",
      paymentStatus: "paid",
    },
    status: "active",
    progress: 95, // 95% quase concluído
    installationAddress: {
      street: "Avenida Paulista",
      number: "1000",
      complement: "Sala 501",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    },
    saleDate: new Date("2024-01-25"),
    estimatedInstallationDate: new Date("2024-02-05"),
    actualInstallationDate: new Date("2024-02-03"),
    activationDate: new Date("2024-02-03"),
    documents: [
      {
        id: "doc-009",
        name: "Proposta_Academia_Fit.pdf",
        type: "signed_proposal",
        url: "https://mock-storage.com/proposta-academia-fit.pdf",
        uploadedAt: new Date("2024-01-25"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-010",
        name: "Contrato_Academia_Fit.pdf",
        type: "contract",
        url: "https://mock-storage.com/contrato-academia-fit.pdf",
        uploadedAt: new Date("2024-01-28"),
        uploadedBy: "user-001",
      },
    ],
    timeline: [
      {
        id: "event-013",
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: new Date("2024-01-25"),
        createdBy: "user-001",
      },
      {
        id: "event-014",
        status: "in_progress",
        description: "Contrato assinado",
        createdAt: new Date("2024-01-28"),
        createdBy: "user-001",
      },
      {
        id: "event-015",
        status: "stock_separated",
        description: "Equipamentos separados no estoque",
        createdAt: new Date("2024-02-01"),
        createdBy: "user-002",
      },
      {
        id: "event-016",
        status: "dispatched",
        description: "Equipamentos despachados",
        createdAt: new Date("2024-02-02"),
        createdBy: "user-002",
      },
      {
        id: "event-017",
        status: "active",
        description: "Instalação concluída",
        createdAt: new Date("2024-02-03"),
        createdBy: "tech-001",
      },
    ],
    notes: "Academia com sistema de segurança básico.",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-02-03"),
    createdBy: "user-001",
  },
  {
    id: "sale-004",
    clientId: "client-003",
    clientName: "Maria Oliveira",
    plan: {
      ...AVAILABLE_PLANS.find((p) => p.id === "plan-replay-bronze")!,
      category: "basic",
    },
    contractType: "equipment_sale",
    equipments: [
      {
        id: "eq-016",
        name: "Roteador Básico",
        model: "RT-1000",
        type: "router",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-017",
        name: "Câmera HD",
        model: "CAM-HD-720",
        type: "camera",
        quantity: 1,
        status: "installed",
      },
    ],
    payment: {
      totalValue: 159.8,
      installationFee: 59.9,
      firstPaymentDate: new Date("2024-03-01"),
      paymentMethod: "pix",
      paymentStatus: "paid",
    },
    status: "active",
    progress: 100, // 100% concluído
    installationAddress: {
      street: "Rua Copacabana",
      number: "500",
      complement: "",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22020-000",
    },
    saleDate: new Date("2024-02-25"),
    estimatedInstallationDate: new Date("2024-03-05"),
    actualInstallationDate: new Date("2024-03-04"),
    activationDate: new Date("2024-03-04"),
    documents: [
      {
        id: "doc-011",
        name: "Proposta_Maria_Oliveira.pdf",
        type: "signed_proposal",
        url: "https://mock-storage.com/proposta-maria-oliveira.pdf",
        uploadedAt: new Date("2024-02-25"),
        uploadedBy: "user-002",
      },
      {
        id: "doc-012",
        name: "Nota_Fiscal_Equipamentos.pdf",
        type: "contract",
        url: "https://mock-storage.com/nota-fiscal-equipamentos.pdf",
        uploadedAt: new Date("2024-03-01"),
        uploadedBy: "user-002",
      },
    ],
    timeline: [
      {
        id: "event-018",
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: new Date("2024-02-25"),
        createdBy: "user-002",
      },
      {
        id: "event-019",
        status: "in_progress",
        description: "Venda de equipamento - pagamento realizado",
        createdAt: new Date("2024-03-01"),
        createdBy: "user-002",
        notes: "Cliente optou por comprar equipamentos diretamente",
      },
      {
        id: "event-020",
        status: "stock_separated",
        description: "Equipamentos separados",
        createdAt: new Date("2024-03-02"),
        createdBy: "user-002",
      },
      {
        id: "event-021",
        status: "active",
        description: "Equipamentos instalados",
        createdAt: new Date("2024-03-04"),
        createdBy: "tech-003",
      },
    ],
    notes: "Cliente novo, contrato de teste. Venda direta de equipamentos.",
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-04"),
    createdBy: "user-002",
  },
  {
    id: "sale-005",
    clientId: "client-006",
    clientName: "Restaurante Sabor do Sul",
    plan: {
      ...AVAILABLE_PLANS.find((p) => p.id === "plan-replay-silver")!,
      category: "intermediate",
    },
    contractType: "simplified_adhesion",
    equipments: [
      {
        id: "eq-018",
        name: "Roteador Padrão",
        model: "RT-3000",
        type: "router",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-019",
        name: "Conversor Óptico",
        model: "CO-200",
        type: "converter",
        quantity: 1,
        status: "installed",
      },
      {
        id: "eq-020",
        name: "Câmera Full HD",
        model: "CAM-FHD-1080",
        type: "camera",
        quantity: 2,
        status: "installed",
      },
      {
        id: "eq-021",
        name: "Banner Publicitário",
        model: "BAN-STANDARD",
        type: "banner",
        quantity: 1,
        status: "installed",
      },
    ],
    payment: {
      totalValue: 229.8,
      installationFee: 79.9,
      firstPaymentDate: new Date("2024-03-15"),
      paymentMethod: "credit_card",
      paymentStatus: "paid",
    },
    status: "active",
    progress: 90, // 90% instalação quase concluída
    installationAddress: {
      street: "Avenida dos Restaurantes",
      number: "1500",
      complement: "",
      neighborhood: "Vila Gastronômica",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    saleDate: new Date("2024-03-10"),
    estimatedInstallationDate: new Date("2024-03-20"),
    actualInstallationDate: new Date("2024-03-18"),
    activationDate: new Date("2024-03-18"),
    documents: [
      {
        id: "doc-013",
        name: "Proposta_Sabor_do_Sul.pdf",
        type: "signed_proposal",
        url: "https://mock-storage.com/proposta-sabor-sul.pdf",
        uploadedAt: new Date("2024-03-10"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-014",
        name: "Contrato_Sabor_do_Sul.pdf",
        type: "contract",
        url: "https://mock-storage.com/contrato-sabor-sul.pdf",
        uploadedAt: new Date("2024-03-12"),
        uploadedBy: "user-001",
      },
      {
        id: "doc-015",
        name: "Fotos_Instalacao_Restaurante.jpg",
        type: "installation_photo",
        url: "https://mock-storage.com/foto-instalacao-restaurante.jpg",
        uploadedAt: new Date("2024-03-18"),
        uploadedBy: "tech-001",
      },
    ],
    timeline: [
      {
        id: "event-022",
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: new Date("2024-03-10"),
        createdBy: "user-001",
      },
      {
        id: "event-023",
        status: "in_progress",
        description: "Contrato assinado",
        createdAt: new Date("2024-03-12"),
        createdBy: "user-001",
      },
      {
        id: "event-024",
        status: "stock_separated",
        description: "Equipamentos separados",
        createdAt: new Date("2024-03-15"),
        createdBy: "user-002",
      },
      {
        id: "event-025",
        status: "dispatched",
        description: "Equipamentos despachados",
        createdAt: new Date("2024-03-17"),
        createdBy: "user-002",
      },
      {
        id: "event-026",
        status: "active",
        description: "Sistema instalado e ativado",
        createdAt: new Date("2024-03-18"),
        createdBy: "tech-001",
      },
    ],
    notes: "Restaurante com sistema de câmeras para segurança.",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-18"),
    createdBy: "user-001",
  },
  {
    id: "sale-006",
    clientId: "client-005",
    clientName: "Pedro Costa",
    plan: {
      ...AVAILABLE_PLANS.find((p) => p.id === "plan-replay-bronze")!,
      category: "basic",
    },
    contractType: "simplified_adhesion",
    equipments: [
      {
        id: "eq-022",
        name: "Roteador Básico",
        model: "RT-1000",
        type: "router",
        quantity: 1,
        status: "pending",
      },
      {
        id: "eq-023",
        name: "Câmera HD",
        model: "CAM-HD-720",
        type: "camera",
        quantity: 1,
        status: "pending",
      },
    ],
    payment: {
      totalValue: 159.8,
      installationFee: 59.9,
      paymentMethod: "pix",
      paymentStatus: "pending",
    },
    status: "analyzing_stock", // Em análise de estoque
    progress: 10, // 10% apenas iniciado
    installationAddress: {
      street: "Rua das Palmeiras",
      number: "789",
      complement: "Casa",
      neighborhood: "Jardim América",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    saleDate: new Date("2024-04-01"),
    estimatedInstallationDate: new Date("2024-04-15"),
    documents: [
      {
        id: "doc-016",
        name: "Proposta_Pedro_Costa.pdf",
        type: "signed_proposal",
        url: "https://mock-storage.com/proposta-pedro-costa.pdf",
        uploadedAt: new Date("2024-04-01"),
        uploadedBy: "user-002",
      },
    ],
    timeline: [
      {
        id: "event-027",
        status: "pending",
        description: "Venda registrada no sistema",
        createdAt: new Date("2024-04-01"),
        createdBy: "user-002",
      },
    ],
    notes: "Aguardando aprovação de documentação e pagamento.",
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01"),
    createdBy: "user-002",
  },
];

// Função para obter vendas mockadas
export const getMockSales = (): Sale[] => {
  return mockSales;
};

// Função para obter uma venda por ID
export const getMockSaleById = (id: string): Sale | undefined => {
  return mockSales.find((sale) => sale.id === id);
};

// Função para filtrar vendas mockadas
export const filterMockSales = (filters: {
  status?: string;
  paymentStatus?: string;
  clientId?: string;
  search?: string;
}): Sale[] => {
  let filtered = [...mockSales];

  if (filters.status) {
    filtered = filtered.filter((sale) => sale.status === filters.status);
  }

  if (filters.paymentStatus) {
    filtered = filtered.filter(
      (sale) => sale.payment.paymentStatus === filters.paymentStatus
    );
  }

  if (filters.clientId) {
    filtered = filtered.filter((sale) => sale.clientId === filters.clientId);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (sale) =>
        sale.clientName.toLowerCase().includes(searchLower) ||
        sale.id.toLowerCase().includes(searchLower) ||
        sale.plan.name.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

