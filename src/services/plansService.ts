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

  async getAllPlans(options?: { onlyActive?: boolean; category?: OfferCategory }): Promise<Plan[]> {
    const ref = collection(db, COLLECTION);
    const constraints = [];

    if (options?.onlyActive) {
      constraints.push(where("isActive", "==", true));
    }
    if (options?.category) {
      constraints.push(where("category", "==", options.category));
    }

    const q = constraints.length
      ? query(ref, ...constraints, orderBy("value", "asc"))
      : query(ref, orderBy("value", "asc"));

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Plan);
  },
};

