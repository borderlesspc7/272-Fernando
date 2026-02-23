# 🔥 Sistema 100% Firebase - Guia de CRUDs

Todos os mocks foram removidos! Agora o sistema está **100% conectado ao Firebase**.

---

## ✅ **O que foi feito:**

1. ❌ **Removidos** todos os arquivos de mock (clientsMock, salesMock, index.ts)
2. ✅ **Removido** fallback para dados mockados nos services
3. ✅ **Limpado** imports de mocks
4. ✅ Agora **tudo vem direto do Firestore**

---

## 📊 **CRUDs Disponíveis:**

### 1️⃣ **CLIENTES** (`clientsService`)

#### ✅ **CREATE - Criar Cliente**
```typescript
import { clientService } from './services/clientsService';

const novoCliente = {
  name: "João Silva",
  email: "joao@email.com",
  phone: "(11) 98765-4321",
  document: "123.456.789-00",
  documentType: "cpf",
  type: "residential",
  addresses: [{
    street: "Rua das Flores",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    isMainAddress: true
  }],
  paymentMethod: "credit_card",
  contractDuration: 12
};

const cliente = await clientService.createClient(novoCliente);
```

#### 📖 **READ - Buscar Clientes**
```typescript
// Buscar todos
const clientes = await clientService.getAllClients();

// Buscar por ID
const cliente = await clientService.getClientById("client-id-123");

// Buscar com filtros
const clientesFiltrados = await clientService.getClientsByFilters({
  status: "active",
  type: "residential",
  search: "João"
});

// Buscar paginado
const resultado = await clientService.getClientsPaginated(1, 10);

// Buscar por texto
const resultados = await clientService.searchClients("joão");

// Estatísticas
const stats = await clientService.getClientStats();
```

#### ✏️ **UPDATE - Atualizar Cliente**
```typescript
const clienteAtualizado = await clientService.updateClient("client-id-123", {
  name: "João Silva Atualizado",
  phone: "(11) 99999-9999"
});

// Atualizar status
await clientService.updateClientStatus("client-id-123", "inactive");
```

#### ❌ **DELETE - Deletar Cliente**
```typescript
await clientService.deleteClient("client-id-123");
```

---

### 2️⃣ **VENDAS** (`salesService`)

#### ✅ **CREATE - Criar Venda**
```typescript
import { salesService } from './services/salesService';

const novaVenda = {
  clientId: "client-id-123",
  clientName: "João Silva",
  plan: {
    id: "plan-1",
    name: "Plano Premium 500MB",
    value: 199.90,
    installationFee: 99.90
  },
  contractType: "simplified_adhesion",
  equipments: [
    {
      id: "eq-1",
      name: "Roteador Premium",
      model: "RT-5000",
      type: "router",
      quantity: 1,
      status: "pending"
    }
  ],
  payment: {
    totalValue: 199.90,
    installationFee: 99.90,
    paymentMethod: "credit_card",
    firstPaymentDate: new Date()
  },
  installationAddress: {
    street: "Rua das Flores",
    number: "123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  },
  estimatedInstallationDate: new Date(),
  createdBy: "user-id-123"
};

const venda = await salesService.createSale(novaVenda);
```

#### 📖 **READ - Buscar Vendas**
```typescript
// Todas vendas
const vendas = await salesService.getAllSales();

// Por ID
const venda = await salesService.getSaleById("sale-id-123");

// Com filtros
const vendasFiltradas = await salesService.getSalesByFilters({
  status: "active",
  paymentStatus: "paid",
  clientId: "client-id-123"
});

// Estatísticas
const stats = await salesService.getSaleStats();
```

#### ✏️ **UPDATE - Atualizar Venda**
```typescript
// Atualizar dados
const vendaAtualizada = await salesService.updateSale("sale-id-123", {
  status: "active",
  actualInstallationDate: new Date()
});

// Atualizar status com timeline
await salesService.updateSaleStatus(
  "sale-id-123",
  "active",
  "Instalação concluída com sucesso",
  "user-id-123"
);

// Adicionar documento
await salesService.addDocument(
  "sale-id-123",
  {
    name: "Contrato Assinado.pdf",
    type: "contract",
    url: "https://storage.com/contrato.pdf"
  },
  "user-id-123"
);
```

#### ❌ **DELETE - Deletar Venda**
```typescript
await salesService.deleteSale("sale-id-123");
```

---

### 3️⃣ **ESTOQUE** (`stockService`)

#### ✅ **CREATE - Criar Item no Estoque**
```typescript
import { stockService } from './services/stockService';

const novoItem = {
  name: "Roteador Premium RT-5000",
  category: "router",
  model: "RT-5000",
  manufacturer: "TP-Link",
  quantity: 50,
  minQuantity: 10,
  unitCost: 150.00,
  location: "Prateleira A-12",
  barcode: "7891234567890"
};

const item = await stockService.createStockItem(novoItem);
```

#### 📖 **READ - Buscar Estoque**
```typescript
// Todos itens
const itens = await stockService.getAllStockItems();

// Por ID
const item = await stockService.getStockItemById("item-id-123");

// Com filtros
const itensFiltrados = await stockService.getStockItemsByFilters({
  category: "router",
  status: "available"
});

// Itens em baixa
const itensBaixos = await stockService.getLowStockItems();

// Estatísticas
const stats = await stockService.getStats();
```

#### ✏️ **UPDATE - Atualizar Estoque**
```typescript
// Atualizar item
const itemAtualizado = await stockService.updateStockItem("item-id-123", {
  quantity: 45,
  location: "Prateleira B-10"
});

// Ajustar quantidade
await stockService.adjustQuantity("item-id-123", 10, "add", "user-id", "Compra");
await stockService.adjustQuantity("item-id-123", 5, "remove", "user-id", "Venda");

// Reservar equipamento
await stockService.reserveEquipment("item-id-123", 2, "sale-id-123");

// Liberar reserva
await stockService.releaseReservation("item-id-123", 2, "sale-id-123");
```

#### ❌ **DELETE - Deletar Item**
```typescript
await stockService.deleteStockItem("item-id-123");
```

---

### 4️⃣ **INSTALAÇÕES** (`installationsService`)

#### ✅ **CREATE - Criar Instalação**
```typescript
import { installationsService } from './services/installationsService';

const novaInstalacao = {
  saleId: "sale-id-123",
  clientId: "client-id-123",
  clientName: "João Silva",
  scheduledDate: new Date("2026-03-01"),
  technicianId: "tech-id-123",
  technicianName: "Carlos Técnico",
  address: {
    street: "Rua das Flores",
    number: "123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  },
  equipments: [
    {
      itemId: "item-id-123",
      name: "Roteador Premium",
      quantity: 1
    }
  ],
  createdBy: "user-id-123"
};

const instalacao = await installationsService.createInstallation(novaInstalacao);
```

#### 📖 **READ - Buscar Instalações**
```typescript
// Todas
const instalacoes = await installationsService.getAllInstallations();

// Por ID
const instalacao = await installationsService.getInstallationById("inst-id-123");

// Por técnico
const instTecnico = await installationsService.getInstallationsByTechnician("tech-id-123");

// Com filtros
const instFiltradas = await installationsService.getInstallationsByFilters({
  status: "scheduled",
  technicianId: "tech-id-123"
});

// Estatísticas
const stats = await installationsService.getStats();
```

#### ✏️ **UPDATE - Atualizar Instalação**
```typescript
// Atualizar
const instAtualizada = await installationsService.updateInstallation("inst-id-123", {
  status: "completed",
  completedAt: new Date()
});

// Atualizar status
await installationsService.updateInstallationStatus(
  "inst-id-123",
  "completed",
  "user-id-123",
  "Instalação finalizada"
);

// Atribuir técnico
await installationsService.assignTechnician("inst-id-123", "tech-id-456");
```

#### ❌ **DELETE - Deletar Instalação**
```typescript
await installationsService.deleteInstallation("inst-id-123");
```

---

### 5️⃣ **OCORRÊNCIAS** (`occurrencesService`)

#### ✅ **CREATE - Criar Ocorrência**
```typescript
import { occurrencesService } from './services/occurrencesService';

const novaOcorrencia = {
  clientId: "client-id-123",
  clientName: "João Silva",
  type: "technical",
  priority: "high",
  title: "Internet lenta",
  description: "Cliente reportando lentidão na conexão",
  reportedBy: "user-id-123"
};

const ocorrencia = await occurrencesService.createOccurrence(novaOcorrencia);
```

#### 📖 **READ - Buscar Ocorrências**
```typescript
// Todas
const ocorrencias = await occurrencesService.getAllOccurrences();

// Por ID
const ocorrencia = await occurrencesService.getOccurrenceById("occ-id-123");

// Por cliente
const occCliente = await occurrencesService.getOccurrencesByClient("client-id-123");

// Abertas
const occAbertas = await occurrencesService.getOpenOccurrences();

// Com filtros
const occFiltradas = await occurrencesService.getOccurrencesByFilters({
  status: "open",
  priority: "high"
});

// Estatísticas
const stats = await occurrencesService.getStats();
```

#### ✏️ **UPDATE - Atualizar Ocorrência**
```typescript
// Atualizar
const occAtualizada = await occurrencesService.updateOccurrence("occ-id-123", {
  status: "in_progress",
  assignedTo: "tech-id-123"
});

// Atribuir técnico
await occurrencesService.assignTechnician("occ-id-123", "tech-id-123");

// Atualizar status
await occurrencesService.updateStatus("occ-id-123", "resolved", "user-id", "Problema resolvido");

// Adicionar comentário
await occurrencesService.addComment("occ-id-123", "user-id", "Verificando conexão");
```

#### ❌ **DELETE - Deletar Ocorrência**
```typescript
await occurrencesService.deleteOccurrence("occ-id-123");
```

---

### 6️⃣ **TÉCNICOS** (`techniciansService`)

#### ✅ **CREATE - Criar Técnico**
```typescript
import { techniciansService } from './services/techniciansService';

const novoTecnico = {
  name: "Carlos Silva",
  email: "carlos@empresa.com",
  phone: "(11) 98765-4321",
  document: "123.456.789-00",
  specialties: ["fibra", "roteadores", "cameras"],
  vehicleType: "car",
  vehiclePlate: "ABC-1234",
  address: {
    street: "Rua X",
    number: "100",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  }
};

const tecnico = await techniciansService.createTechnician(novoTecnico);
```

---

## 🎯 **Como Usar no Frontend:**

### Exemplo: Página de Clientes

```typescript
import { useState, useEffect } from 'react';
import { clientService } from '../services/clientsService';
import { toast } from '../components/ui/Toast';

export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (clientData) => {
    try {
      await clientService.createClient(clientData);
      toast.success("Cliente criado com sucesso!");
      loadClients(); // Recarrega lista
    } catch (error) {
      toast.error("Erro ao criar cliente");
    }
  };

  const handleDelete = async (id) => {
    try {
      await clientService.deleteClient(id);
      toast.success("Cliente deletado!");
      loadClients();
    } catch (error) {
      toast.error("Erro ao deletar");
    }
  };

  return (
    // JSX aqui
  );
}
```

---

## ✅ **Está tudo pronto!**

- ❌ **SEM** dados mockados
- ✅ **100%** Firebase real
- ✅ **Todos** os CRUDs funcionando
- ✅ **Toast** para feedback
- ✅ **Tratamento** de erros

**Agora é só usar! 🚀**
