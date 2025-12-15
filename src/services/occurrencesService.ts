import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';
import type {
  Occurrence,
  OccurrenceFilters,
  OccurrenceStats,
  OccurrenceStatus,
  OccurrenceCommunication,
  OccurrencePhoto,
} from '../types/occurrences';

const OCCURRENCES_COLLECTION = 'occurrences';

// Helper function to convert Firestore Timestamps to Dates
function convertTimestampToDate(data: Record<string, unknown>): Occurrence {
  const converted = { ...data } as unknown as Occurrence;

  if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
    converted.createdAt = (data.createdAt as Timestamp).toDate();
  }
  if (data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt) {
    converted.updatedAt = (data.updatedAt as Timestamp).toDate();
  }
  if (data.resolvedAt && typeof data.resolvedAt === 'object' && 'toDate' in data.resolvedAt) {
    converted.resolvedAt = (data.resolvedAt as Timestamp).toDate();
  }

  // Convert photos array
  if (Array.isArray(converted.photos)) {
    converted.photos = converted.photos.map((photo: unknown) => {
      const p = photo as Record<string, unknown>;
      if (p.uploadedAt && typeof p.uploadedAt === 'object' && 'toDate' in p.uploadedAt) {
        return {
          ...p,
          uploadedAt: (p.uploadedAt as Timestamp).toDate(),
        } as OccurrencePhoto;
      }
      return photo as OccurrencePhoto;
    });
  }

  // Convert communications array
  if (Array.isArray(converted.communications)) {
    converted.communications = converted.communications.map((comm: unknown) => {
      const c = comm as Record<string, unknown>;
      if (c.createdAt && typeof c.createdAt === 'object' && 'toDate' in c.createdAt) {
        return {
          ...c,
          createdAt: (c.createdAt as Timestamp).toDate(),
        } as OccurrenceCommunication;
      }
      return comm as OccurrenceCommunication;
    });
  }

  return converted;
}

// Mock data for visualization
function getMockOccurrences(): Occurrence[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'occ-001',
      clientId: 'client-001',
      clientName: 'João Silva',
      saleId: 'sale-001',
      type: 'connection',
      priority: 'high',
      status: 'in_progress',
      title: 'Sem conexão à internet',
      description: 'Cliente reporta que está sem internet desde ontem à noite.',
      assignedTechnicianId: 'tech-001',
      assignedTechnicianName: 'Carlos Técnico',
      photos: [],
      communications: [
        {
          id: 'comm-001',
          userId: 'client-001',
          userName: 'João Silva',
          message: 'Estou sem internet desde ontem.',
          createdAt: yesterday,
          isInternal: false,
        },
        {
          id: 'comm-002',
          userId: 'tech-001',
          userName: 'Carlos Técnico',
          message: 'Vou verificar o equipamento hoje pela manhã.',
          createdAt: now,
          isInternal: false,
        },
      ],
      createdAt: yesterday,
      updatedAt: now,
    },
    {
      id: 'occ-002',
      clientId: 'client-002',
      clientName: 'Maria Santos',
      saleId: 'sale-002',
      type: 'equipment',
      priority: 'medium',
      status: 'open',
      title: 'Roteador com luz vermelha',
      description: 'O roteador está com a luz vermelha piscando.',
      photos: [],
      communications: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'occ-003',
      clientId: 'client-003',
      clientName: 'Pedro Oliveira',
      saleId: 'sale-003',
      type: 'billing',
      priority: 'low',
      status: 'resolved',
      title: 'Dúvida sobre fatura',
      description: 'Cliente tem dúvidas sobre valores cobrados na última fatura.',
      assignedTechnicianId: 'support-001',
      assignedTechnicianName: 'Ana Suporte',
      photos: [],
      communications: [
        {
          id: 'comm-003',
          userId: 'client-003',
          userName: 'Pedro Oliveira',
          message: 'Por que minha fatura veio mais cara este mês?',
          createdAt: twoDaysAgo,
          isInternal: false,
        },
        {
          id: 'comm-004',
          userId: 'support-001',
          userName: 'Ana Suporte',
          message: 'Foi cobrado o valor da instalação. Já expliquei por telefone.',
          createdAt: yesterday,
          isInternal: false,
        },
      ],
      createdAt: twoDaysAgo,
      updatedAt: yesterday,
      resolvedAt: yesterday,
    },
  ];
}

export const occurrencesService = {
  async getAllOccurrences(filters?: OccurrenceFilters): Promise<Occurrence[]> {
    try {
      const occurrencesRef = collection(db, OCCURRENCES_COLLECTION);
      let q = query(occurrencesRef, orderBy('createdAt', 'desc'));

      if (filters?.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return getMockOccurrences();
      }

      const occurrences = snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return convertTimestampToDate({ ...data, id: doc.id });
      });

      return occurrences;
    } catch (error) {
      console.error('Error fetching occurrences:', error);
      return getMockOccurrences();
    }
  },

  async getOccurrenceById(id: string): Promise<Occurrence | null> {
    try {
      const docRef = doc(db, OCCURRENCES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Try to find in mock data
        const mockData = getMockOccurrences();
        return mockData.find((occ) => occ.id === id) || null;
      }

      const data = docSnap.data() as Record<string, unknown>;
      return convertTimestampToDate({ ...data, id: docSnap.id });
    } catch (error) {
      console.error('Error fetching occurrence:', error);
      const mockData = getMockOccurrences();
      return mockData.find((occ) => occ.id === id) || null;
    }
  },

  async createOccurrence(
    data: Omit<Occurrence, 'id' | 'createdAt' | 'updatedAt' | 'photos' | 'communications'>
  ): Promise<string> {
    try {
      const occurrencesRef = collection(db, OCCURRENCES_COLLECTION);
      const newOccurrence = {
        ...data,
        photos: [],
        communications: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(occurrencesRef, newOccurrence);
      return docRef.id;
    } catch (error) {
      console.error('Error creating occurrence:', error);
      throw error;
    }
  },

  async updateOccurrence(
    id: string,
    data: Partial<Omit<Occurrence, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, OCCURRENCES_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      } as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating occurrence:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: OccurrenceStatus): Promise<void> {
    try {
      const docRef = doc(db, OCCURRENCES_COLLECTION, id);
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (status === 'resolved') {
        updateData.resolvedAt = Timestamp.now();
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating occurrence status:', error);
      throw error;
    }
  },

  async addCommunication(
    occurrenceId: string,
    communication: Omit<OccurrenceCommunication, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      const occurrence = await this.getOccurrenceById(occurrenceId);
      if (!occurrence) throw new Error('Occurrence not found');

      const newCommunication: OccurrenceCommunication = {
        ...communication,
        id: `comm-${Date.now()}`,
        createdAt: new Date(),
      };

      const updatedCommunications = [...occurrence.communications, newCommunication];

      await this.updateOccurrence(occurrenceId, {
        communications: updatedCommunications,
      });
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  },

  async addPhoto(
    occurrenceId: string,
    photo: Omit<OccurrencePhoto, 'id' | 'uploadedAt'>
  ): Promise<void> {
    try {
      const occurrence = await this.getOccurrenceById(occurrenceId);
      if (!occurrence) throw new Error('Occurrence not found');

      const newPhoto: OccurrencePhoto = {
        ...photo,
        id: `photo-${Date.now()}`,
        uploadedAt: new Date(),
      };

      const updatedPhotos = [...occurrence.photos, newPhoto];

      await this.updateOccurrence(occurrenceId, {
        photos: updatedPhotos,
      });
    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  },

  async assignTechnician(
    occurrenceId: string,
    technicianId: string,
    technicianName: string
  ): Promise<void> {
    try {
      await this.updateOccurrence(occurrenceId, {
        assignedTechnicianId: technicianId,
        assignedTechnicianName: technicianName,
        status: 'in_progress',
      });
    } catch (error) {
      console.error('Error assigning technician:', error);
      throw error;
    }
  },

  async getStats(): Promise<OccurrenceStats> {
    try {
      const occurrences = await this.getAllOccurrences();

      const stats: OccurrenceStats = {
        total: occurrences.length,
        open: occurrences.filter((o) => o.status === 'open').length,
        inProgress: occurrences.filter((o) => o.status === 'in_progress').length,
        resolved: occurrences.filter((o) => o.status === 'resolved').length,
        highPriority: occurrences.filter(
          (o) => o.priority === 'high' || o.priority === 'urgent'
        ).length,
        avgResolutionTime: 0,
      };

      // Calculate average resolution time
      const resolvedOccurrences = occurrences.filter(
        (o) => o.status === 'resolved' && o.resolvedAt
      );
      if (resolvedOccurrences.length > 0) {
        const totalTime = resolvedOccurrences.reduce((sum, occ) => {
          if (occ.resolvedAt) {
            const diff = occ.resolvedAt.getTime() - occ.createdAt.getTime();
            return sum + diff / (1000 * 60 * 60); // Convert to hours
          }
          return sum;
        }, 0);
        stats.avgResolutionTime = Math.round(totalTime / resolvedOccurrences.length);
      }

      return stats;
    } catch (error) {
      console.error('Error getting occurrence stats:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        avgResolutionTime: 0,
        highPriority: 0,
      };
    }
  },
};

