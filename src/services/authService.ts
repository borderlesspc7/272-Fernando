import { auth } from "../lib/firebaseconfig";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import type { User } from "../types/user";
import { webviewBridge } from "../lib/webviewBridge";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();

    const user = this.mapFirebaseUser(userCredential.user);

    this.saveToken(token);
    this.saveUser(user);

    // Enviar token para o sistema pai
    webviewBridge.sendToken(token);

    return user;
  },

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
    this.clearAuth();
    webviewBridge.sendToParent({ type: "LOGOUT" });
  },

  // Salvar token recebido do WebView pai
  setTokenFromWebView(token: string): void {
    this.saveToken(token);
    // Aqui você pode validar/decodificar o token se necessário
  },

  // Observar mudanças de autenticação do Firebase
  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = this.mapFirebaseUser(firebaseUser);
        this.saveUser(user);
        callback(user);
      } else {
        this.clearAuth();
        callback(null);
      }
    });
  },

  // Helpers
  mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || undefined,
    };
  },

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
