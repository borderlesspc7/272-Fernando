import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";

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

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />

        {/* Rotas com layout */}
        <Route
          path={paths.home}
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path={paths.dashboard}
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

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

        <Route
          path={paths.stock}
          element={
            <Layout>
              <Stock />
            </Layout>
          }
        />

        <Route
          path={paths.logistics}
          element={
            <Layout>
              <Logistics />
            </Layout>
          }
        />

        <Route
          path={paths.technicians}
          element={
            <Layout>
              <Technicians />
            </Layout>
          }
        />

        <Route
          path={paths.installations}
          element={
            <Layout>
              <Installations />
            </Layout>
          }
        />

        <Route
          path={paths.occurrences}
          element={
            <Layout>
              <Occurrences />
            </Layout>
          }
        />

        <Route
          path={paths.reports}
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />

        <Route
          path={paths.profile}
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
