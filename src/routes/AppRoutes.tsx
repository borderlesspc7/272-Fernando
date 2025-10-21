import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { paths } from "./paths";

export function AppRoutes() {
  function Home() {
    return <div>Home</div>;
  }
  function Login() {
    return <div>Login</div>;
  }
  function Dashboard() {
    return <div>Dashboard</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
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
