import React from 'react';
import './Contacto.css';
import SobreNosotros from '../SobreNosotros/SobreNosotros';
import { HashLink } from 'react-router-hash-link';
import { useLocation } from 'react-router-dom';

const Contacto = () => {
  const location = useLocation();
  const isStandalonePage = location.pathname === '/contacto';

  return (
    <div className={isStandalonePage ? "contacto-page-container" : "contacto-page-container contacto-in-main"} id="contacto" data-nav-theme="contacto">
      {/* Mostrar equipo solo en página independiente */}
      {isStandalonePage && (
        <>
          {/* Spacer para empujar el equipo hacia abajo */}
          <div className="spacer"></div>
          
          {/* Sección del equipo para Contacto */}
          <div className="contacto-equipo-section">
            <SobreNosotros showHeader={false} showEquipoTitle={false} />
          </div>
        </>
      )}
      
      {/* Sección específica de contacto */}
      <div className="contacto-section">

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section footer-logo">
            <div className="logo-container">
              <img src="/cSolido.png" alt="SeqUOH Logo" className="footer-logo-image" />
              <span className="logo-text">SeqUOH</span>
            </div>
          </div>

          <div className="footer-section footer-menu">
            <h4>Menú</h4>
            <ul>
              <li><HashLink smooth to="/#inicio">Inicio</HashLink></li>
              <li><HashLink smooth to="/#learn-more">Descubre</HashLink></li>
              <li><HashLink smooth to="/#conoce">Conoce</HashLink></li>
              <li><HashLink smooth to="/#obten">Obtén el tuyo</HashLink></li>
              <li><HashLink smooth to="/#faq">Preguntas</HashLink></li>
              <li><HashLink smooth to="/#equipo">Acerca de</HashLink></li>
              <li><HashLink smooth to="/#contacto">Contacto</HashLink></li>
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h4>Contáctanos</h4>
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span>seq@uoh.cl</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span>Avenida Libertador Bernardo O' Higgins 611, Rancagua, Subterráneo Edificio A</span>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
                </svg>
              </div>
              <div>
                <div className="schedule-title">Horario de Atención:</div>
                <div>8:30 a 16:30 hrs</div>
              </div>
            </div>
          </div>

          <div className="footer-section footer-social">
            <h4>Redes Sociales</h4>
            <div className="social-links">
              <a href="https://www.instagram.com/biocompu_uoh" className="social-link" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Contacto;