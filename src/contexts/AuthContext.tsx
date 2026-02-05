import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/user";
import type { ReactNode } from "react";
import type { FirebaseError } from "firebase/app";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logOut: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.login(credentials);
      setUser(user);
    } catch (error) {
      setError(
        getFirebaseErrorMessage(error as FirebaseError | string)
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(credentials);
      setUser(null);
    } catch (error) {
      setError(
        getFirebaseErrorMessage(error as FirebaseError | string)
      );
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logOut();
      setUser(null);
    } catch (error) {
      setError(
        getFirebaseErrorMessage(error as FirebaseError | string)
      );
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      const message = getFirebaseErrorMessage(
        error as FirebaseError | string
      );
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logOut,
        changePassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
