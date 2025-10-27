import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { Layout } from "../components/Layout/Layout";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";
import { Clients } from "../pages/Clients/Clients";
import { Sales } from "../pages/Sales/Sales";

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
        <Route path={paths.dashboard} element={<Dashboard />} />
        <Route
          path={paths.clients}
          element={
            <Layout>
              <Clients />
            </Layout>
          }
        />
        <Route
          path={paths.sales}
          element={
            <Layout>
              <Sales />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
