import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Postlogin.css';
import DashboardHome from './DashboardHome'; 

const Postlogin = () => {
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'enfermedades', icon: '/public/heart.png', label: 'Enfermedades', description: 'Explora tu genética en relación con la salud, descubriendo predisposiciones a enfermedades complejas y mutaciones.' },
    { id: 'ancestria', icon: '/public/ancestria.png', label: 'Ancestría', description: 'Explora tu genética ancestral para conocer tus orígenes. Descubrir conexiones con distintas poblaciones.' },
    { id: 'biomarcadores', icon: '/public/biomarcadores.png', label: 'Biomarcadores', description: 'Explora los biomarcadores genéticos para identificar características específicas en tu ADN.' },
    { id: 'farmacogenetica', icon: '/public/farmacogenetica.png', label: 'Farmacogenética', description: 'Explora cómo tu genética influye en la forma en que tu cuerpo responde a medicamentos.' },
    { id: 'rasgos', icon: '/public/rasgos.png', label: 'Rasgos', description: 'Descubre los rasgos genéticos que definen tus características físicas y comportamentales.' },
    { id: 'biometricas', icon: '/public/biometrica.png', label: 'Biométrica', description: 'Explora tus datos biométricos para comprender características físicas y fisiológicas.' },
  ];
  
  const handleLogout = () => {
    navigate('/');
  };

  const renderContent = () => {
    if (activeSection === null) {
      return <DashboardHome menuItems={menuItems} setActiveSection={setActiveSection} />;
    }

    switch(activeSection) {
      case 'enfermedades':
        return (
          <div className="content-section">
            <h2>Enfermedades</h2>
            <p>Información sobre enfermedades relacionadas con tu perfil genético.</p>
          </div>
        );
      case 'ancestria':
         return (
          <div className="content-section">
            <h2>Análisis de Ancestría</h2>
            <p>Descubre tu origen étnico y geográfico basado en tu ADN.</p>
          </div>
        );
      case 'biomarcadores':
      return (
        <div className="content-section">
          <h2>Biomarcadores</h2>
          <p>Aquí va la información detallada sobre tus biomarcadores genéticos.</p>
        </div>
      );
    case 'farmacogenetica':
      return (
        <div className="content-section">
          <h2>Farmacogenética</h2>
          <p>Aquí va la información detallada sobre tu respuesta a medicamentos.</p>
        </div>
      );
    case 'rasgos':
      return (
        <div className="content-section">
          <h2>Rasgos</h2>
          <p>Aquí va la información detallada sobre tus rasgos físicos y de comportamiento.</p>
        </div>
      );
    case 'biometricas':
      return (
        <div className="content-section">
          <h2>Biométrica</h2>
          <p>Aquí va la información detallada sobre tus datos biométricos.</p>
        </div>
      );
    case 'pregunta':
        return (
          <div className="content-section">
            <h2>Pregunta a la IA</h2>
            <p>Aquí iría la interfaz para interactuar con el asistente de IA.</p>
          </div>
        );
      default:
        return <DashboardHome menuItems={menuItems} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="postlogin-container">
      <div className="sidebar">
        <div className="logo-section">
        {/* Añadimos un onClick que sirve para volver al inicio del Postlogin cuando se toca el logo */}
        <div className="logo-clickable" onClick={() => setActiveSection(null)}>
          <div className="logo">
            <img src="/cSolido.png" alt="SeqUOH Logo" className="logo-icon" />
            <h1 className="logo-text">SeqUOH</h1>
            <div className="logo-underline"></div>
          </div>
        </div>
      </div>

        <nav className="menu-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <img src={item.icon} alt={item.label} className="menu-icon" />
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
          <button
              className={`menu-item ${activeSection === 'pregunta' ? 'active' : ''}`}
              onClick={() => setActiveSection('pregunta')}
          >
              <img src="/public/robotia.png" alt="Pregunta a la IA" className="menu-icon" />
              <span className="menu-label">Pregunta a la IA</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <ArrowRight className="logout-icon" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Postlogin;