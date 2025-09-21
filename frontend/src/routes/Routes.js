// routes/Routes.js
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Páginas
import LoginForm from "../components/LoginForm";
import Register from "../components/Register";

// Más adelante podrás importar Dashboard, Perfil, etc.

export default function AppRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route
        path="/"
        element={
          <Layout>
            <h1 className="login-title">Ingresa a tu Cuenta</h1>
            <p className="login-subtitle">con las credenciales entregadas</p>
            <hr className="login-divider" />
            <div className="login-box">
              <LoginForm />
            </div>
          </Layout>
        }
      />

      {/* Registro */}
      <Route
        path="/register"
        element={
          <Layout>
            <h1 className="login-title">Crea tu Cuenta</h1>
            <p className="login-subtitle">llenando los datos requeridos</p>
            <hr className="login-divider" />
            <div className="login-box">
              <Register />
            </div>
          </Layout>
        }
      />

      {/* Aquí irán las demás rutas */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/perfil" element={<Perfil />} /> */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
