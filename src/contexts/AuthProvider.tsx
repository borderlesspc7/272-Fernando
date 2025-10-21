import { useState, useEffect, type ReactNode } from "react";
import type { AuthState } from "../types/auth";
import { authService } from "../services/authService";
import { webviewBridge } from "../lib/webviewBridge";
import { AuthContext } from "./AuthContext";

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const savedToken = authService.getToken();
    const savedUser = authService.getUser();

    if (savedToken && savedUser) {
      setState({
        user: savedUser,
        token: savedToken,
        loading: false,
        isAuthenticated: true,
      });
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }

    const unsubscribe = authService.onAuthChange((user) => {
      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAuthenticated: !!user,
      }));
    });

    const handleWebViewToken = (message: any) => {
      if (message.token) {
        setTokenFromWebView(message.token);
      }
    };

    webviewBridge.on("AUTH_TOKEN", handleWebViewToken);

    if (!savedToken) {
      webviewBridge.requestToken();
    }

    return () => {
      unsubscribe();
      webviewBridge.off("AUTH_TOKEN", handleWebViewToken);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const user = await authService.login(email, password);
      const token = authService.getToken();

      setState({
        user,
        token,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    authService.logout();
    setState({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  const setTokenFromWebView = (token: string) => {
    authService.setTokenFromWebView(token);
    setState((prev) => ({ ...prev, token, isAuthenticated: true }));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, setTokenFromWebView }}
    >
      {children}
    </AuthContext.Provider>
  );
}
