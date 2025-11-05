// src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./pages/Hero/Hero";
import Descubre from "./pages/Descubre/Descubre";
import Conoce from "./pages/Conoce/Conoce";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import PostloginRouter from "./pages/Postlogin/PostloginRouter";
import NoPurchased from "./pages/NoPurchased/NoPurchased";
import Pending from "./pages/Pending/Pending";
import ProtectedRoute from "./components/ProtectedRoute";
import GenomaPricing from "./pages/GenomaPricing/GenomaPricing";
import SobreNosotros from "./pages/SobreNosotros/SobreNosotros";
import Contacto from "./pages/Contacto/Contacto";
import Preguntas from "./pages/Preguntas/Preguntas";
import Enfermedades from "./pages/Enfermedades/Enfermedades";
import AdminReports from "./pages/Postlogin/AdminReports";

export default function App() {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/no-purchased" ||
    pathname === "/pending" ||
    pathname.startsWith("/dashboard");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Descubre />
              <Conoce />
              <GenomaPricing />
              <Preguntas/>
              <SobreNosotros />
              <Contacto />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/no-purchased" element={<ProtectedRoute requireService={false}><NoPurchased /></ProtectedRoute>} />
        <Route path="/pending" element={<ProtectedRoute requireService={false}><Pending /></ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute><PostloginRouter /></ProtectedRoute>} />
        {/* Catch-all: redirige cualquier ruta desconocida a la página de inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
