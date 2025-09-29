// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Descubre from "./components/Descubre/Descubre";
import Conoce from "./components/Conoce/Conoce";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Postlogin from "./components/Postlogin/Postlogin";
import GenomaPricing from "./components/GenomaPricing/GenomaPricing";
import SobreNosotros from "./components/SobreNosotros/SobreNosotros";
import Contacto from "./components/Contacto/Contacto";
import Preguntas from "./components/Preguntas/Preguntas";

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
        <Route path="/dashboard" element={<Postlogin />} />
      </Routes>
    </>
  );
}
