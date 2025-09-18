// src/components/Descubre/Descubre.jsx
import { useEffect, useRef, useState } from "react";
import "./Descubre.css";

const Descubre = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      number: "1",
      title: "Enfermedades",
      description: "Tu ADN revela predisposiciones a ciertas condiciones de salud, útil para prevención y cuidado personal.",
      image: "/descubre/Enfermedades.png",
      delay: "1s"
    },
    {
      number: "2", 
      title: "Rasgos Genéticos",
      description: "Descubre características únicas determinadas por tu genética, como sueño, sabores o energía.",
      image: "/descubre/Geneticos.png",
      delay: "1s"
    },
    {
      number: "3",
      title: "Biométricas",
      description: "Conoce cómo tus genes influyen en tu cuerpo: metabolismo, peso, altura y otros indicadores.",
      image: "/descubre/Biometricas.png", 
      delay: "1.4s"
    },
    {
      number: "4",
      title: "Ancestría",
      description: "Explora tus orígenes y la diversidad genética que compone tu historia familiar.",
      image: "/descubre/Ancestria.png",
      delay: "1.4s"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="descubre" 
      data-nav-theme="light" 
      id="learn-more"
    >
      <div className="descubre-container">
        <div className="descubre-content">
          <div className={`descubre-header ${isVisible ? 'animate' : ''}`}>
            <div className="breadcrumb">Descubre</div>
            <h2 className="descubre-title">
              Tu ADN guarda información<br />
              <span className="title-accent">única sobre ti</span>
            </h2>
            <p className="descubre-subtitle">
              Transformamos tu ADN en reportes claros que revelan tu salud,
              rasgos, biometría y ancestría
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${isVisible ? 'animate' : ''}`}
                style={{ '--delay': feature.delay }}
              >
                <div className="card-image">
                  <img src={feature.image} alt={feature.title} />
                </div>
                <div className="card-content">
                  <div className="card-number">{feature.number}</div>
                  <h3 className="card-title">{feature.title}</h3>
                  <p className="card-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Descubre;