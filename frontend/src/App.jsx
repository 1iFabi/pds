// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./pages/Hero/Hero";
import Descubre from "./pages/Descubre/Descubre";
import Conoce from "./pages/Conoce/Conoce";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Postlogin from "./pages/Postlogin/Postlogin";
import ProtectedRoute from "./components/ProtectedRoute";
import GenomaPricing from "./pages/GenomaPricing/GenomaPricing";
import SobreNosotros from "./pages/SobreNosotros/SobreNosotros";
import Contacto from "./pages/Contacto/Contacto";
import Preguntas from "./pages/Preguntas/Preguntas";

export default function App() {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
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
        <Route path="/dashboard" element={<ProtectedRoute><Postlogin /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
