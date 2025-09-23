// src/components/Hero/Hero.jsx
import { useEffect, useRef } from "react";
import "./Hero.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDna, faGlobe, faNotesMedical } from "@fortawesome/free-solid-svg-icons";

export default function Hero() {
  const videoRef = useRef(null);
  const base = import.meta.env.BASE_URL; // <- clave para assets en /public

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
          // opción 1: src directo (si tu webm está en public/HelixDNA.webm)
          src={`${base}HelixDNA.webm`}
        >
          {/* opción 2: <source> con fallback mp4 */}
          {/* 
          <source src={`${base}HelixDNA.webm`} type="video/webm" />
          <source src={`${base}HelixDNA.mp4`} type="video/mp4" />
          */}
        </video>
        <div className="hero-overlay" />
      </div>

      <div className="hero-rail">
        <button className="rail-btn"><FontAwesomeIcon icon={faDna} size="lg" /></button>
        <button className="rail-btn"><FontAwesomeIcon icon={faGlobe} size="lg" /></button>
        <button className="rail-btn"><FontAwesomeIcon icon={faNotesMedical} size="lg" /></button>
      </div>

      <div className="hero-bl">
        <h1 className="hero-title">
          Descubre la historia que tu<br />ADN tiene para contarte.
        </h1>
      </div>

      <div className="hero-br">
        <p className="hero-kicker">Explora tu mapa genético de manera clara, confiable e interactiva.</p>
        <a href="#learn-more" className="cta">Descubre <span aria-hidden>↗</span></a>
      </div>
    </section>
  );
}
