import type { Client } from "../types/clients";
import { Timestamp } from "firebase/firestore";

// Mock de clientes com dados realistas
export const mockClients: Client[] = [
  {
    id: "client-001",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    alternativePhone: "(11) 3456-7890",
    document: "123.456.789-00",
    documentType: "cpf",
    type: "residential",
    status: "active",
    addresses: [
      {
        street: "Rua das Flores",
        number: "123",
        complement: "Apto 45",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        isMainAddress: true,
      },
    ],
    contacts: [
      {
        name: "Maria Silva",
        phone: "(11) 98765-4322",
        email: "maria.silva@email.com",
        relationship: "Cônjuge",
      },
    ],
    instagram: "@joaosilva",
    paymentMethod: "credit_card",
    contractDuration: 12,
    contractStartDate: new Date("2024-01-15"),
    contractEndDate: new Date("2025-01-15"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "user-001",
    notes: "Cliente preferencial, sempre pontual nos pagamentos.",
    tags: ["premium", "fidelidade"],
  },
  {
    id: "client-002",
    name: "Academia Fit Center",
    email: "contato@academiafit.com.br",
    phone: "(11) 3456-7890",
    document: "12.345.678/0001-90",
    documentType: "cnpj",
    type: "commercial",
    status: "active",
    companyName: "Academia Fit Center Ltda",
    tradeName: "Fit Center",
    stateRegistration: "123.456.789.012",
    addresses: [
      {
        street: "Avenida Paulista",
        number: "1000",
        complement: "Sala 501",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
        isMainAddress: true,
      },
    ],
    contacts: [
      {
        name: "Carlos Santos",
        phone: "(11) 98765-4323",
        email: "carlos@academiafit.com.br",
        relationship: "Gerente",
      },
    ],
    instagram: "@academiafitcenter",
    paymentMethod: "bank_transfer",
    contractDuration: 24,
    contractStartDate: new Date("2024-02-01"),
    contractEndDate: new Date("2026-02-01"),
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-02-01"),
    createdBy: "user-001",
    notes: "Cliente comercial grande, contrato de 2 anos.",
    tags: ["comercial", "grande-contrato"],
  },
  {
    id: "client-003",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(21) 98765-4324",
    document: "987.654.321-00",
    documentType: "cpf",
    type: "residential",
    status: "active",
    addresses: [
      {
        street: "Rua Copacabana",
        number: "500",
        complement: "",
        neighborhood: "Copacabana",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22020-000",
        isMainAddress: true,
      },
    ],
    instagram: "@mariaoliveira",
    paymentMethod: "pix",
    contractDuration: 6,
    contractStartDate: new Date("2024-03-01"),
    contractEndDate: new Date("2024-09-01"),
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-01"),
    createdBy: "user-002",
    notes: "Cliente novo, contrato de teste de 6 meses.",
    tags: ["novo-cliente"],
  },
  {
    id: "client-004",
    name: "Quadra Sports Club",
    email: "admin@quadrasports.com.br",
    phone: "(11) 2345-6789",
    document: "98.765.432/0001-10",
    documentType: "cnpj",
    type: "commercial",
    status: "active",
    companyName: "Quadra Sports Club Ltda",
    tradeName: "Quadra Sports",
    stateRegistration: "987.654.321.098",
    addresses: [
      {
        street: "Rua dos Esportes",
        number: "2500",
        complement: "",
        neighborhood: "Vila Olímpica",
        city: "São Paulo",
        state: "SP",
        zipCode: "04567-890",
        isMainAddress: true,
      },
    ],
    contacts: [
      {
        name: "Roberto Alves",
        phone: "(11) 98765-4325",
        email: "roberto@quadrasports.com.br",
        relationship: "Diretor",
      },
      {
        name: "Ana Paula",
        phone: "(11) 98765-4326",
        email: "ana@quadrasports.com.br",
        relationship: "Coordenadora",
      },
    ],
    instagram: "@quadrasports",
    paymentMethod: "bank_slip",
    contractDuration: 36,
    contractStartDate: new Date("2024-01-01"),
    contractEndDate: new Date("2027-01-01"),
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2024-01-01"),
    createdBy: "user-001",
    notes: "Cliente premium com sistema completo de quadras. Contrato de 3 anos.",
    tags: ["premium", "grande-contrato", "quadras"],
  },
  {
    id: "client-005",
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    phone: "(11) 98765-4327",
    document: "111.222.333-44",
    documentType: "cpf",
    type: "residential",
    status: "pending",
    addresses: [
      {
        street: "Rua das Palmeiras",
        number: "789",
        complement: "Casa",
        neighborhood: "Jardim América",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        isMainAddress: true,
      },
    ],
    instagram: "@pedrocosta",
    paymentMethod: "pix",
    contractDuration: 12,
    createdAt: new Date("2024-04-01"),
    createdBy: "user-002",
    notes: "Aguardando aprovação de documentação.",
    tags: ["pendente"],
  },
  {
    id: "client-006",
    name: "Restaurante Sabor do Sul",
    email: "contato@sabordosul.com.br",
    phone: "(11) 3456-7891",
    document: "11.222.333/0001-44",
    documentType: "cnpj",
    type: "commercial",
    status: "active",
    companyName: "Restaurante Sabor do Sul Ltda",
    tradeName: "Sabor do Sul",
    stateRegistration: "111.222.333.444",
    addresses: [
      {
        street: "Avenida dos Restaurantes",
        number: "1500",
        complement: "",
        neighborhood: "Vila Gastronômica",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        isMainAddress: true,
      },
    ],
    contacts: [
      {
        name: "Fernanda Lima",
        phone: "(11) 98765-4328",
        email: "fernanda@sabordosul.com.br",
        relationship: "Proprietária",
      },
    ],
    instagram: "@sabordosul",
    paymentMethod: "credit_card",
    contractDuration: 12,
    contractStartDate: new Date("2024-03-15"),
    contractEndDate: new Date("2025-03-15"),
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-15"),
    createdBy: "user-001",
    notes: "Restaurante com sistema de câmeras para segurança.",
    tags: ["comercial", "segurança"],
  },
  {
    id: "client-007",
    name: "Ana Beatriz",
    email: "ana.beatriz@email.com",
    phone: "(21) 98765-4329",
    document: "555.666.777-88",
    documentType: "cpf",
    type: "residential",
    status: "inactive",
    addresses: [
      {
        street: "Rua das Acácias",
        number: "321",
        complement: "Bloco B, Apto 12",
        neighborhood: "Barra da Tijuca",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22790-000",
        isMainAddress: true,
      },
    ],
    instagram: "@anabeatriz",
    paymentMethod: "debit_card",
    contractDuration: 12,
    contractStartDate: new Date("2023-06-01"),
    contractEndDate: new Date("2024-06-01"),
    createdAt: new Date("2023-05-25"),
    updatedAt: new Date("2024-06-01"),
    lastServiceDate: new Date("2024-05-15"),
    createdBy: "user-002",
    notes: "Contrato encerrado. Cliente não renovou.",
    tags: ["inativo"],
  },
  {
    id: "client-008",
    name: "Centro Esportivo Municipal",
    email: "admin@centroesportivo.gov.br",
    phone: "(11) 2345-6790",
    document: "00.000.000/0001-00",
    documentType: "cnpj",
    type: "commercial",
    status: "active",
    companyName: "Centro Esportivo Municipal",
    tradeName: "CEM",
    stateRegistration: "000.000.000.000",
    addresses: [
      {
        street: "Avenida Municipal",
        number: "5000",
        complement: "",
        neighborhood: "Centro Administrativo",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-200",
        isMainAddress: true,
      },
    ],
    contacts: [
      {
        name: "José da Silva",
        phone: "(11) 98765-4330",
        email: "jose.silva@centroesportivo.gov.br",
        relationship: "Diretor Administrativo",
      },
    ],
    instagram: "@centroesportivomunicipal",
    paymentMethod: "bank_transfer",
    contractDuration: 48,
    contractStartDate: new Date("2023-01-01"),
    contractEndDate: new Date("2027-01-01"),
    createdAt: new Date("2022-12-15"),
    updatedAt: new Date("2023-01-01"),
    createdBy: "user-001",
    notes: "Cliente público, contrato de 4 anos. Sistema completo com múltiplas quadras.",
    tags: ["público", "grande-contrato", "quadras"],
  },
];

// Função para obter clientes mockados
export const getMockClients = (): Client[] => {
  return mockClients;
};

// Função para obter um cliente por ID
export const getMockClientById = (id: string): Client | undefined => {
  return mockClients.find((client) => client.id === id);
};

// Função para filtrar clientes mockados
export const filterMockClients = (filters: {
  status?: string;
  type?: string;
  search?: string;
}): Client[] => {
  let filtered = [...mockClients];

  if (filters.status) {
    filtered = filtered.filter((client) => client.status === filters.status);
  }

  if (filters.type) {
    filtered = filtered.filter((client) => client.type === filters.type);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(searchLower) ||
        client.document.includes(searchLower) ||
        (client.companyName &&
          client.companyName.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
};

