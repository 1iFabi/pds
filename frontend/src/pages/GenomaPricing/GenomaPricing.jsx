import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenomaPricing.css';

const GenomaPricing = () => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // --- PASO 1: CREA LA FUNCIÓN DE NAVEGACIÓN ---
  // Esta función redirige al usuario a la página de registro.
  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div id="obten" className="genoma-pricing" data-nav-theme="light">
      <div className="main-content">
        <div className="content-container">
          {/* Sección de Precios */}
          <div className="pricing-section">
            <div className="pricing-card">
              {/* Encabezado con la estructura final (centrado y apilado) */}
              <header className="card-header">
                <span className="card-badge">Obtén el Tuyo</span>
                <div className="header-text-content">
                  <h1 className="card-title">
                    El precio de
                    <br />
                    tu genoma
                  </h1>
                  <p className="card-subtitle">
                    Por un precio único, accede a todos los servicios que ofrecemos y descubre lo que tu genética tiene reservado para ti
                  </p>
                </div>
              </header>

              <div className="pricing-box">
                {/* Contenedor para el layout de 2 columnas */}
                <div className="box-content-wrapper">
                  {/* Columna Izquierda: Información de Precio */}
                  <div className="price-info-column">
                    <div className="price-header">
                      <h2 className="price-title">Precio Único</h2>
                      <p className="price-description">Accede a toda tu información genética.</p>
                    </div>

                    <div className="price-display">
                      <span className="price-amount">$300 USD</span>
                      <span className="price-conversion">En CLP $291.162</span>
                    </div>
                  </div>

                  {/* Columna Derecha: Características */}
                  <div className="features-container">
                    <ul className="features-list">
                      <li className="feature-item">
                        <div className="checkmark">✓</div>
                        <span>Enfermedades</span>
                      </li>
                      <li className="feature-item">
                        <div className="checkmark">✓</div>
                        <span>Ancestría</span>
                      </li>
                      <li className="feature-item">
                        <div className="checkmark">✓</div>
                        <span>Biométricas</span>
                      </li>
                      <li className="feature-item">
                        <div className="checkmark">✓</div>
                        <span>Rasgos</span>
                      </li>
                      <li className="feature-item">
                        <div className="checkmark">✓</div>
                        <span>Biomarcadores</span>
                      </li>
                      <li className="feature-item">
                        <div className="checkmark">✓</div>
                        <span>Farmacogenética</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* --- PASO 2: AGREGA EL onClick AL BOTÓN --- */}
                <button className="cta-button" onClick={handleRegisterClick}>
                  ¡Llévame al registro!
                </button>
              </div>
            </div>
          </div>

          {/* Sección de Ilustración */}
          <div className="illustration-section">
            <div className="image-container">
              {imageError ? (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '550px',
                    height: '500px',
                    background: 'linear-gradient(135deg, #4A90E2 0%, #277EAF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20px',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: '500',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
                    <p>Científico con microscopio</p>
                    <p style={{ opacity: 0.8, fontSize: '1rem' }}>obtén_el_tuyo.png</p>
                  </div>
                </div>
              ) : (
                <img src="/obten_el_tuyo.png" alt="Científico con microscopio - Obtén el tuyo" className="hero-image" onError={() => setImageError(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenomaPricing;