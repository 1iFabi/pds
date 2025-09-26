// src/components/Navbar/Navbar.jsx
import "./Navbar.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const base = import.meta.env.BASE_URL;

const Navbar = ({ theme = "dark" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const btnRef = useRef(null);

  const logoSrc =
    theme === "light" ? `${base}cNormal.png` : `${base}cSolido.png`;

  // Bloquea scroll cuando el drawer está abierto
  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => (document.documentElement.style.overflow = "");
  }, [isOpen]);

  // Cerrar con ESC y clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    const onClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        // si el click viene del botón, ignorar
        if (btnRef.current && btnRef.current.contains(e.target)) return;
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClickOutside);
    };
  }, [isOpen]);

  const closeAnd = (fn) => () => {
    setIsOpen(false);
    if (typeof fn === "function") fn();
  };

  // Función para recargar la página
  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsOpen(false); // Cerrar drawer si está abierto
    window.location.href = '/';
  };

  return (
    <>
      <nav className={`navbar navbar--${theme}`} aria-label="Principal">
        {/* izquierda: links desktop */}
        <div className="nav-left nav-desktop">
          <HashLink smooth to="/#inicio">Inicio</HashLink>
          <HashLink smooth to="/#learn-more">Descubre</HashLink>
          <HashLink smooth to="/#conoce">Conoce</HashLink>
          <HashLink smooth to="/#obten">Obtén el Tuyo</HashLink>
        </div>

        {/* centro (logo) */}
        <div className="nav-logo" aria-label="Genomia logo">
          <a href="/" className="logo-link" onClick={handleLogoClick}>
            <img src={logoSrc} alt="Genomia logo" />
          </a>
        </div>

        {/* derecha: links desktop */}
        <div className="nav-right nav-desktop">
          <HashLink smooth to="/#faq">Preguntas</HashLink>
          <HashLink smooth to="/#equipo">Equipo</HashLink>
          <HashLink smooth to="/#contacto">Contacto</HashLink>
          <Link to="/login" className="login-btn">Inicia Sesión</Link>
        </div>

        {/* botón burger (solo mobile) */}
        <button
          ref={btnRef}
          className="nav-toggle"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
          aria-controls="mobile-drawer"
          onClick={() => setIsOpen((v) => !v)}
        >
          {/* ícono: cambia entre burger y X */}
          {!isOpen ? (
            // burger
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // close
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* overlay + drawer mobile */}
      <div
        className={`drawer-overlay ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <aside
          id="mobile-drawer"
          ref={drawerRef}
          className={`mobile-drawer navbar--${theme}`}
          role="dialog"
          aria-label="Menú"
        >
          <div className="drawer-header">
            <a href="/" className="logo-link" onClick={handleLogoClick}>
              <img src={logoSrc} alt="Genomia logo" />
            </a>
            <button
              className="drawer-close"
              aria-label="Cerrar menú"
              onClick={() => setIsOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6l-12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav className="drawer-links">
            {/* replicamos tus secciones, usando HashLink para el scroll suave */}
            <HashLink smooth to="/#inicio" onClick={closeAnd()}>Inicio</HashLink>
            <HashLink smooth to="/#learn-more" onClick={closeAnd()}>Descubre</HashLink>
            <HashLink smooth to="/#conoce" onClick={closeAnd()}>Conoce</HashLink>
            <HashLink smooth to="/#obten" onClick={closeAnd()}>Obtén el Tuyo</HashLink>

            <div className="drawer-sep" />

            <HashLink smooth to="/#faq" onClick={closeAnd()}>Preguntas</HashLink>
            <HashLink smooth to="/#equipo" onClick={closeAnd()}>Equipo</HashLink>
            <HashLink smooth to="/#contacto" onClick={closeAnd()}>Contacto</HashLink>

            <Link to="/login" className="login-btn" onClick={closeAnd()}>
              Inicia Sesión
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default Navbar;