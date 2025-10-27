import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { paths } from "./paths";

interface ProtectedRoutesProps {
  children: React.ReactNode;
}

export function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  return <>{children}</>;
}
