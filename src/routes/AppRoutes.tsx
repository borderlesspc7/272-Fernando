import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoutes } from "./ProtectedRoutes";

import { Layout } from "../components/Layout/Layout";

import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import { Clients } from "../pages/Clients/Clients";
import { Sales } from "../pages/Sales/Sales";
import { Stock } from "../pages/Stock/Stock";
import { Logistics } from "../pages/Logistics/Logistics";
import { Installations } from "../pages/Installations/Installations";
import Occurrences from "../pages/Occurrences/Occurrences";
import Technicians from "../pages/Technicians/Technicians";
import Reports from "../pages/Reports/Reports";
import Profile from "../pages/Profile/Page";
import Configuration from "../pages/Configurations/Configuration";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />

        {/* Rotas protegidas com layout */}
        <Route
          path={paths.home}
          element={
            <ProtectedRoutes>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoutes>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.clients}
          element={
            <ProtectedRoutes>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.sales}
          element={
            <ProtectedRoutes>
              <Layout>
                <Sales />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.stock}
          element={
            <ProtectedRoutes>
              <Layout>
                <Stock />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.logistics}
          element={
            <ProtectedRoutes>
              <Layout>
                <Logistics />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.technicians}
          element={
            <ProtectedRoutes>
              <Layout>
                <Technicians />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.installations}
          element={
            <ProtectedRoutes>
              <Layout>
                <Installations />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.occurrences}
          element={
            <ProtectedRoutes>
              <Layout>
                <Occurrences />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.reports}
          element={
            <ProtectedRoutes>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path={paths.profile}
          element={
            <ProtectedRoutes>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoutes>
              <Layout>
                <Configuration />
              </Layout>
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
