// src/components/Navbar/Navbar.jsx
import "./Navbar.css";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const base = import.meta.env.BASE_URL;

const Navbar = ({ theme = "dark" }) => {
  const isLight = theme === "light";
  // tus logos están en public/  →  public/cNormal.png, public/cSolido.png
  const logoSrc = theme === "light" ? `${base}cNormal.png` : `${base}cSolido.png`;

  return (
    <nav className={`navbar navbar--${theme}`} aria-label="Principal">
      {/* izquierda: links a secciones del landing */}
      <div className="nav-left">
        <HashLink smooth to="/#inicio">Inicio</HashLink>
        <HashLink smooth to="/#learn-more">Descubre</HashLink>
        <HashLink smooth to="/#conoce">Conoce</HashLink>
        <Link to="/obten-el-tuyo">Obtén el Tuyo</Link>
      </div>

      {/* centro (logo) */}
      <div className="nav-logo" aria-label="Genomia logo">
        <Link to="/" className="logo-link">
          <img src={logoSrc} alt="Genomia logo" />
        </Link>
      </div>

      {/* derecha */}
      <div className="nav-right">
        <HashLink smooth to="/#faq">Preguntas</HashLink>
        <Link to="/sobre-nosotros">Equipo</Link>
        <HashLink smooth to="/#contacto">Contacto</HashLink>
        <Link to="/login" className="login-btn">Inicia Sesión</Link>
      </div>
    </nav>
  );
};

export default Navbar;