import type { User } from "./user";

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokenFromWebView: (token: string) => void;
}

export interface WebViewMessage {
  type: "AUTH_TOKEN" | "LOGOUT" | "TOKEN_REQUEST";
  token?: string;
  data?: unknown;
}
