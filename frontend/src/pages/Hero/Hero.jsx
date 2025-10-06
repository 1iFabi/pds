// src/components/Hero/Hero.jsx
import { useEffect, useRef } from "react";
import "./Hero.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDna, faGlobe, faNotesMedical } from "@fortawesome/free-solid-svg-icons";

export default function Hero() {
  const videoRef = useRef(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches && videoRef.current) videoRef.current.pause();
  }, []);

  return (
    <section className="hero" data-nav-theme="dark" id="inicio">
      <div className="hero-media">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          src={`${base}HelixDNA.webm`}
        ></video>
        <div className="hero-overlay" />
      </div>
      
      {/* The .hero-rail div is no longer here */}

      <div className="hero-bl">
        {/* It has been moved inside the title's container */}
        <div className="hero-rail">
          <button className="rail-btn" data-label="ADN">
            <FontAwesomeIcon icon={faDna} size="lg" />
          </button>
          <button className="rail-btn" data-label="Mundo">
            <FontAwesomeIcon icon={faGlobe} size="lg" />
          </button>
          <button className="rail-btn" data-label="Salud">
            <FontAwesomeIcon icon={faNotesMedical} size="lg" />
          </button>
        </div>
        <h1 className="hero-title">
          Descubre la historia que tu<br />ADN tiene para contarte.
        </h1>
      </div>

      <div className="hero-br">
        <p className="hero-kicker">Explora tu mapa genético de manera clara, confiable e interactiva.</p>
        <a href="#learn-more" className="cta">Ingresa Aquí <span aria-hidden>↗</span></a>
      </div>
    </section>
  );
}