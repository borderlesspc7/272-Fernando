import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Plan, OfferCategory } from "../types/sales";

const COLLECTION = "plans";

export const plansService = {
  async createPlan(data: Omit<Plan, "id">): Promise<Plan> {
    const ref = doc(collection(db, COLLECTION));
    const newPlan: Plan = {
      id: ref.id,
      ...data,
      isActive: data.isActive ?? true,
    };
    await setDoc(ref, newPlan);
    return newPlan;
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Plano não encontrado");
    await updateDoc(ref, data);
    const updated = await getDoc(ref);
    return updated.data() as Plan;
  },

  async deletePlan(id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
  },

  async getPlanById(id: string): Promise<Plan | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Plan;
  },

  async getAllPlans(options?: {
    onlyActive?: boolean;
    category?: OfferCategory;
  }): Promise<Plan[]> {
    const ref = collection(db, COLLECTION);
    // Busca todos ordenados por valor e filtra em memória para não precisar de índice composto
    const q = query(ref, orderBy("value", "asc"));
    const snap = await getDocs(q);
    let plans = snap.docs.map((d) => d.data() as Plan);

    if (options?.onlyActive) {
      plans = plans.filter((p) => p.isActive !== false);
    }
    if (options?.category) {
      plans = plans.filter((p) => p.category === options.category);
    }

    return plans;
  },
};

