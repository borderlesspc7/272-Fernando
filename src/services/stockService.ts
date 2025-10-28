import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type {
  StockItem,
  StockEntry,
  StockDispatch,
  StockMovement,
  SeparationOrder,
  CreateStockItemData,
  UpdateStockItemData,
  CreateStockEntryData,
  CreateStockDispatchData,
  StockFilters,
  StockStats,
} from "../types/stock";

const STOCK_ITEMS_COLLECTION = "stock_items";
const STOCK_ENTRIES_COLLECTION = "stock_entries";
const STOCK_DISPATCHES_COLLECTION = "stock_dispatches";
const STOCK_MOVEMENTS_COLLECTION = "stock_movements";
const SEPARATION_ORDERS_COLLECTION = "separation_orders";

// Converter Timestamp para Date
const convertTimestampToDate = <T extends Record<string, any>>(data: T): T => {
  const converted: any = { ...data };

  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key]?.toDate instanceof Function) {
      converted[key] = converted[key].toDate();
    }
  });

  return converted;
};

export const stockService = {
  // ========== ITEMS ==========
  async createItem(data: CreateStockItemData): Promise<StockItem> {
    try {
      const itemRef = doc(collection(db, STOCK_ITEMS_COLLECTION));
      const now = Timestamp.now();

      const newItem: StockItem = {
        id: itemRef.id,
        ...data,
        status: data.status || "available",
        reservedQuantity: 0,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(itemRef, newItem);

      // Criar movimentação de entrada inicial
      if (data.quantity > 0) {
        await this.createMovement({
          itemId: newItem.id,
          itemName: newItem.name,
          type: "entry",
          quantity: data.quantity,
          description: "Entrada inicial no estoque",
          performedBy: data.createdBy,
          previousQuantity: 0,
          newQuantity: data.quantity,
        });
      }

      return convertTimestampToDate(newItem);
    } catch (error) {
      console.error("Erro ao criar item:", error);
      throw new Error("Não foi possível criar o item.");
    }
  },

  async getItemById(itemId: string): Promise<StockItem | null> {
    try {
      const itemRef = doc(db, STOCK_ITEMS_COLLECTION, itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        return null;
      }

      return convertTimestampToDate(itemSnap.data() as StockItem);
    } catch (error) {
      console.error("Erro ao buscar item:", error);
      throw new Error("Não foi possível buscar o item.");
    }
  },

  async getAllItems(): Promise<StockItem[]> {
    try {
      const itemsRef = collection(db, STOCK_ITEMS_COLLECTION);
      const q = query(itemsRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as StockItem)
      );
    } catch (error) {
      console.error("Erro ao buscar items:", error);
      throw new Error("Não foi possível buscar os items.");
    }
  },

  async getItemsByFilters(filters: StockFilters): Promise<StockItem[]> {
    try {
      let items = await this.getAllItems();

      if (filters.category) {
        items = items.filter((item) => item.category === filters.category);
      }

      if (filters.status) {
        items = items.filter((item) => item.status === filters.status);
      }

      if (filters.warehouse) {
        items = items.filter(
          (item) => item.location.warehouse === filters.warehouse
        );
      }

      if (filters.lowStock) {
        items = items.filter((item) => item.quantity <= item.minimumStock);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.model.toLowerCase().includes(searchLower) ||
            item.manufacturer?.toLowerCase().includes(searchLower)
        );
      }

      return items;
    } catch (error) {
      console.error("Erro ao buscar items com filtros:", error);
      throw new Error("Não foi possível buscar os items.");
    }
  },

  async updateItem(
    itemId: string,
    data: UpdateStockItemData
  ): Promise<StockItem> {
    try {
      const itemRef = doc(db, STOCK_ITEMS_COLLECTION, itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        throw new Error("Item não encontrado");
      }

      await updateDoc(itemRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });

      const updatedItemSnap = await getDoc(itemRef);
      return convertTimestampToDate(updatedItemSnap.data() as StockItem);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      throw new Error("Não foi possível atualizar o item.");
    }
  },

  async deleteItem(itemId: string): Promise<void> {
    try {
      const itemRef = doc(db, STOCK_ITEMS_COLLECTION, itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      throw new Error("Não foi possível deletar o item.");
    }
  },

  // ========== ENTRIES ==========
  async createEntry(data: CreateStockEntryData): Promise<StockEntry> {
    try {
      const batch = writeBatch(db);
      const entryRef = doc(collection(db, STOCK_ENTRIES_COLLECTION));
      const itemRef = doc(db, STOCK_ITEMS_COLLECTION, data.itemId);

      const itemSnap = await getDoc(itemRef);
      if (!itemSnap.exists()) {
        throw new Error("Item não encontrado");
      }

      const item = itemSnap.data() as StockItem;
      const now = Timestamp.now();

      const newEntry: StockEntry = {
        id: entryRef.id,
        itemId: data.itemId,
        itemName: item.name,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: data.quantity * data.unitPrice,
        supplier: data.supplier,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate
          ? Timestamp.fromDate(data.invoiceDate)
          : undefined,
        receivedBy: data.createdBy,
        receivedDate: now,
        notes: data.notes,
        createdAt: now,
        createdBy: data.createdBy,
      };

      // Criar entrada
      batch.set(entryRef, newEntry);

      // Atualizar quantidade do item
      const newQuantity = item.quantity + data.quantity;
      batch.update(itemRef, {
        quantity: newQuantity,
        updatedAt: now,
      });

      await batch.commit();

      // Criar movimentação
      await this.createMovement({
        itemId: data.itemId,
        itemName: item.name,
        type: "entry",
        quantity: data.quantity,
        description: `Entrada de estoque - NF: ${data.invoiceNumber || "N/A"}`,
        performedBy: data.createdBy,
        previousQuantity: item.quantity,
        newQuantity,
        referenceId: entryRef.id,
        referenceType: "entry",
      });

      return convertTimestampToDate(newEntry);
    } catch (error) {
      console.error("Erro ao criar entrada:", error);
      throw new Error("Não foi possível criar a entrada.");
    }
  },

  async getAllEntries(): Promise<StockEntry[]> {
    try {
      const entriesRef = collection(db, STOCK_ENTRIES_COLLECTION);
      const q = query(entriesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as StockEntry)
      );
    } catch (error) {
      console.error("Erro ao buscar entradas:", error);
      throw new Error("Não foi possível buscar as entradas.");
    }
  },

  // ========== DISPATCHES ==========
  async createDispatch(data: CreateStockDispatchData): Promise<StockDispatch> {
    try {
      const batch = writeBatch(db);
      const dispatchRef = doc(collection(db, STOCK_DISPATCHES_COLLECTION));
      const now = Timestamp.now();

      // Validar e atualizar items
      const itemsWithNames = await Promise.all(
        data.items.map(async (item) => {
          const itemRef = doc(db, STOCK_ITEMS_COLLECTION, item.itemId);
          const itemSnap = await getDoc(itemRef);

          if (!itemSnap.exists()) {
            throw new Error(`Item ${item.itemId} não encontrado`);
          }

          const stockItem = itemSnap.data() as StockItem;

          if (stockItem.quantity < item.quantity) {
            throw new Error(`Quantidade insuficiente para ${stockItem.name}`);
          }

          // Atualizar quantidade
          batch.update(itemRef, {
            quantity: stockItem.quantity - item.quantity,
            updatedAt: now,
          });

          return {
            itemId: item.itemId,
            itemName: stockItem.name,
            quantity: item.quantity,
          };
        })
      );

      const newDispatch: StockDispatch = {
        id: dispatchRef.id,
        items: itemsWithNames,
        saleId: data.saleId,
        clientId: data.clientId,
        clientName: data.clientId || "",
        destination: data.destination,
        dispatchDate: Timestamp.fromDate(data.dispatchDate),
        dispatchedBy: data.createdBy,
        technician: data.technician,
        technicianContact: data.technicianContact,
        status: "dispatched",
        trackingCode: data.trackingCode,
        estimatedDelivery: data.estimatedDelivery
          ? Timestamp.fromDate(data.estimatedDelivery)
          : undefined,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
      };

      batch.set(dispatchRef, newDispatch);
      await batch.commit();

      // Criar movimentações
      for (const item of data.items) {
        const itemSnap = await getDoc(
          doc(db, STOCK_ITEMS_COLLECTION, item.itemId)
        );
        const stockItem = itemSnap.data() as StockItem;

        await this.createMovement({
          itemId: item.itemId,
          itemName: stockItem.name,
          type: "exit",
          quantity: -item.quantity,
          description: `Despacho para ${data.destination}`,
          performedBy: data.createdBy,
          previousQuantity: stockItem.quantity + item.quantity,
          newQuantity: stockItem.quantity,
          referenceId: dispatchRef.id,
          referenceType: "dispatch",
        });
      }

      return convertTimestampToDate(newDispatch);
    } catch (error) {
      console.error("Erro ao criar despacho:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o despacho."
      );
    }
  },

  async getAllDispatches(): Promise<StockDispatch[]> {
    try {
      const dispatchesRef = collection(db, STOCK_DISPATCHES_COLLECTION);
      const q = query(dispatchesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as StockDispatch)
      );
    } catch (error) {
      console.error("Erro ao buscar despachos:", error);
      throw new Error("Não foi possível buscar os despachos.");
    }
  },

  // ========== MOVEMENTS ==========
  async createMovement(
    data: Omit<StockMovement, "id" | "createdAt">
  ): Promise<void> {
    try {
      const movementRef = doc(collection(db, STOCK_MOVEMENTS_COLLECTION));

      const newMovement: StockMovement = {
        ...data,
        id: movementRef.id,
        createdAt: Timestamp.now(),
      };

      await setDoc(movementRef, newMovement);
    } catch (error) {
      console.error("Erro ao criar movimentação:", error);
      // Não lançar erro para não interromper operações principais
    }
  },

  async getMovementsByItem(itemId: string): Promise<StockMovement[]> {
    try {
      const movementsRef = collection(db, STOCK_MOVEMENTS_COLLECTION);
      const q = query(
        movementsRef,
        where("itemId", "==", itemId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as StockMovement)
      );
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error);
      throw new Error("Não foi possível buscar as movimentações.");
    }
  },

  // ========== SEPARATION ORDERS ==========
  async createSeparationOrder(
    saleId: string,
    clientId: string,
    clientName: string,
    planName: string,
    items: {
      itemId: string;
      itemName: string;
      model: string;
      quantity: number;
    }[],
    createdBy: string,
    deadline?: Date
  ): Promise<SeparationOrder> {
    try {
      const orderRef = doc(collection(db, SEPARATION_ORDERS_COLLECTION));
      const now = Timestamp.now();

      const newOrder: SeparationOrder = {
        id: orderRef.id,
        saleId,
        clientId,
        clientName,
        planName,
        items: items.map((item) => ({ ...item, separated: false })),
        status: "pending",
        deadline: deadline ? Timestamp.fromDate(deadline) : undefined,
        createdAt: now,
        createdBy,
      };

      await setDoc(orderRef, newOrder);
      return convertTimestampToDate(newOrder);
    } catch (error) {
      console.error("Erro ao criar ordem de separação:", error);
      throw new Error("Não foi possível criar a ordem de separação.");
    }
  },

  async getSeparationOrders(): Promise<SeparationOrder[]> {
    try {
      const ordersRef = collection(db, SEPARATION_ORDERS_COLLECTION);
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate(doc.data() as SeparationOrder)
      );
    } catch (error) {
      console.error("Erro ao buscar ordens:", error);
      throw new Error("Não foi possível buscar as ordens.");
    }
  },

  async updateSeparationOrderStatus(
    orderId: string,
    status: SeparationOrder["status"],
    userId: string
  ): Promise<void> {
    try {
      const orderRef = doc(db, SEPARATION_ORDERS_COLLECTION, orderId);
      const updates: any = {
        status,
      };

      if (status === "separating") {
        updates.startedAt = Timestamp.now();
        updates.separatedBy = userId;
      }

      if (status === "ready") {
        updates.completedAt = Timestamp.now();
      }

      await updateDoc(orderRef, updates);
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      throw new Error("Não foi possível atualizar a ordem.");
    }
  },

  async reserveItemsForSale(
    items: { itemId: string; quantity: number }[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      for (const item of items) {
        const itemRef = doc(db, STOCK_ITEMS_COLLECTION, item.itemId);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          const stockItem = itemSnap.data() as StockItem;
          batch.update(itemRef, {
            reservedQuantity: stockItem.reservedQuantity + item.quantity,
          });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error("Erro ao reservar items:", error);
      throw new Error("Não foi possível reservar os items.");
    }
  },

  // ========== STATISTICS ==========
  async getStats(): Promise<StockStats> {
    try {
      const [items, orders] = await Promise.all([
        this.getAllItems(),
        this.getSeparationOrders(),
      ]);

      const stats: StockStats = {
        totalItems: items.length,
        totalValue: items.reduce(
          (sum, item) => sum + (item.unitPrice || 0) * item.quantity,
          0
        ),
        lowStockItems: items.filter(
          (item) => item.quantity <= item.minimumStock
        ).length,
        availableItems: items.filter((item) => item.status === "available")
          .length,
        reservedItems: items.filter((item) => item.status === "reserved")
          .length,
        dispatchedItems: items.filter((item) => item.status === "dispatched")
          .length,
        defectiveItems: items.filter((item) => item.status === "defective")
          .length,
        pendingSeparations: orders.filter(
          (order) => order.status === "pending" || order.status === "separating"
        ).length,
        categories: [],
      };

      // Contar por categoria
      const categoryCounts = new Map<string, number>();
      items.forEach((item) => {
        categoryCounts.set(
          item.category,
          (categoryCounts.get(item.category) || 0) + 1
        );
      });

      stats.categories = Array.from(categoryCounts.entries()).map(
        ([category, count]) => ({
          category: category as any,
          count,
        })
      );

      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw new Error("Não foi possível buscar as estatísticas.");
    }
  },
};
