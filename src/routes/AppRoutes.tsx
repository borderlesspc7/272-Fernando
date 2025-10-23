import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { paths } from "./paths";
import { Layout } from "../components/Layout/Layout";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";

export function AppRoutes() {
  function Dashboard() {
    return (
      <Layout>
        <div>Dashboard</div>
      </Layout>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<Dashboard />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
