// src/components/Obten/Obten.jsx
import "./Obten.css";

export default function Obten() {
  return (
    <section className="obten-section" data-nav-theme="light">
      <div className="obten-container">
        <div className="obten-content">
          <div className="obten-card">
            <div className="obten-badge">Obtén el Tuyo</div>
            <h2 className="obten-title">
              El precio de<br />
              tu genoma
            </h2>
            <p className="obten-description">
              Por un precio único, accede a todos los servicios que ofrecemos y
              descubre lo que tu genética tiene reservado para ti
            </p>
            
            <div className="pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-title">Precio Único</h3>
                <p className="pricing-subtitle">
                  Accede a toda tu información genética.
                </p>
              </div>
              
              <div className="pricing-amount">
                <span className="price-main">$300 USD</span>
                <span className="price-clp">En CLP $291162</span>
              </div>
              
              <div className="features-list">
                <div className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Enfermedades</span>
                </div>
                <div className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Ancestría</span>
                </div>
                <div className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Biométricas</span>
                </div>
                <div className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Rasgos</span>
                </div>
                <div className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Biomarcadores</span>
                </div>
                <div className="feature-item">
                  <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Farmacogenética</span>
                </div>
              </div>
              
              <button className="cta-button">
                Quiero que me contacten
              </button>
            </div>
          </div>
        </div>
        
        <div className="obten-illustration">
          <div className="image-container">
            <div className="circular-frame">
              <div className="image-placeholder">
                {/* Replace this div with your actual image */}
                <img 
                  src="/cNormal.png" 
                  alt="Scientist with microscope" 
                  className="scientist-image"
                />
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="floating-elements">
              <div className="bubble bubble-1"></div>
              <div className="bubble bubble-2"></div>
              <div className="bubble bubble-3"></div>
              <div className="dna-icon dna-1">🧬</div>
              <div className="dna-icon dna-2">🔬</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}