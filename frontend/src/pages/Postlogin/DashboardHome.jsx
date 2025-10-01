import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

const DashboardHome = ({ menuItems, setActiveSection }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div>
          {}
          <h2>
            <span className="title-line-1">Grupos de </span>
            <span className="title-line-2">características analizadas</span>
          </h2>
          <p>
            Aquí reunimos distintos grupos de características para mostrarte cómo tu
            información genética se asocia con enfermedades, rasgos, ancestros, entre
            otros. Explora cada categoría para descubrir una descripción detallada y
            personalizada.
          </p>
        </div>
        <button className="pdf-button">
          <Download size={24} strokeWidth={2.5} />
          <span>Descargar PDF</span>
        </button>
      </div>

      <div className="cards-grid">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="card"
            onClick={() => setActiveSection(item.id)}
          >
            <div className="card-header">
              <div className="card-icon-container">
                <img src={item.icon} alt={item.label} className="card-icon" />
              </div>
              <h3 className="card-title">{item.label}</h3>
            </div>
            <div className="card-body">
              <p>{item.description}</p>
            </div>
            <div className="card-footer">
              <span>Ver detalles</span>
              <ChevronDown size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* === Chatbot Banner (FAB en esquina inferior derecha) === */}
      <div
        className={`chatbot-banner ${chatOpen ? 'open' : ''}`}
        onMouseEnter={() => setChatOpen(true)}
        onMouseLeave={() => setChatOpen(false)}
        >
        <div className="chatbot-pill" aria-hidden={!chatOpen}>
            <span className="chatbot-message-full">¡Hola! Soy tu asistente genético. Escríbeme si tienes preguntas sobre tu genoma</span>
            <span className="chatbot-message-short">¡Hola! Pregúntame sobre tu genoma</span>
            <span className="chatbot-message-mini">Asistente genético</span>
        </div>

        <button
            type="button"
            className="chatbot-fab"
            aria-label="Abrir chatbot"
            onClick={() => setChatOpen((v) => !v)} 
        >
            <img
            src="/postlogin/asistente_ia.png"
            alt=""
            className="chatbot-fab-icon"
            />
        </button>
      </div>

    </div>
  );
};

export default DashboardHome;
