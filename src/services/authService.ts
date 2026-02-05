import { auth, db } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updateProfile as updateFirebaseProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface firebaseError {
  code?: string;
  message?: string;
}

export const authService = {
  async logOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      const userData = userDoc.data() as User;

      const updatedUser = {
        ...userData,
        lastLogin: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), updatedUser);
      return updatedUser;
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      const newUser: User = {
        uid: firebaseUser.uid,
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        role: credentials.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      return newUser;
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("Usuário não autenticado");

      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      const currentData = userDoc.data() as User;

      if (data.name) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: data.name,
        });
      }

      if (data.email && data.email !== currentData.email) {
        await updateEmail(firebaseUser, data.email);
      }

      const updatedUser: User = {
        ...currentData,
        name: data.name ?? currentData.name,
        email: data.email ?? currentData.email,
        updatedAt: new Date(),
      };

      await setDoc(userRef, updatedUser);
      return updatedUser;
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error("Usuário não autenticado");
      }

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  observeAuthState(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      callback(userDoc.exists() ? (userDoc.data() as User) : null);
    });
  },
};
