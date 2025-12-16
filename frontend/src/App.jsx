// src/App.jsx
import { useCallback, useEffect, useRef } from "react";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
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
import { apiRequest, API_ENDPOINTS, clearToken, getToken } from "./config/api";

const LandingPage = ({ targetId }) => {
  useEffect(() => {
    if (!targetId) return;
    const scroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    const raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [targetId]);

  return (
    <>
      <Hero />
      <Descubre />
      <Conoce />
      <GenomaPricing />
      <Preguntas/>
      <SobreNosotros />
      <Contacto />
    </>
  );
};

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
  const isLoggedIn = Boolean(getToken());
  const shouldWatchInactivity =
    isLoggedIn && pathname !== "/login" && pathname !== "/register";

  const handleLogout = useCallback(async () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: "POST" });
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      clearToken();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (!shouldWatchInactivity) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      return;
    }
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_LIMIT_MS);
  }, [handleLogout, shouldWatchInactivity]);

  // Cierre automático tras 5 minutos sin interacción
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    const onActivity = () => resetInactivityTimer();

    events.forEach((evt) => window.addEventListener(evt, onActivity));
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onActivity));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    resetInactivityTimer();
  }, [pathname, resetInactivityTimer]);

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/inicio" element={<LandingPage targetId="inicio" />} />
        <Route path="/descubre" element={<LandingPage targetId="descubre" />} />
        <Route path="/conoce" element={<LandingPage targetId="conoce" />} />
        <Route path="/obten" element={<LandingPage targetId="obten" />} />
        <Route path="/preguntas" element={<LandingPage targetId="preguntas" />} />
        <Route path="/equipo" element={<LandingPage targetId="equipo" />} />
        <Route path="/contacto" element={<LandingPage targetId="contacto" />} />
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
