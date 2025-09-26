// SobreNosotros.jsx
import React from 'react';
import './SobreNosotros.css';

const SobreNosotros = () => {
  const equipoMiembros = [
    {
      id: 'alex',
      nombre: 'Dr. Alex Di Genova',
      cargo: 'Director de SeqUOH',
      imagen: 'alex',
      linkedin: 'https://www.linkedin.com/in/alex-di-genova-522b99246'
    },
    {
      id: 'carol',
      nombre: 'Dra. Carol Moraga',
      cargo: 'Subdirectora SeqUOH',
      imagen: 'carol',
      linkedin: 'https://www.linkedin.com/in/camoragaq'
    },
    {
      id: 'susan',
      nombre: 'Mag. Susan Calfunao',
      cargo: 'Encargada de Laboratorio SeqUOH',
      imagen: 'susan',
      linkedin: 'https://www.linkedin.com/in/susan-calfunao-caro-367a3173'
    },
    {
      id: 'gabriel',
      nombre: 'Gabriel Cabas',
      cargo: 'Investigador asociado SeqUOH',
      imagen: 'gabriel',
      linkedin: 'https://www.linkedin.com/in/gabriel-cabas-1834601b4'
    },
    {
      id: 'jonathan',
      nombre: 'Jonathan Canan',
      cargo: 'Encargado HPC-UOH',
      imagen: 'jonathan',
      linkedin: 'https://www.linkedin.com/in/jonathan-canan-469896238'
    }
  ];

  return (
    <div id="equipo" className="sobre-nosotros-container" data-nav-theme="light">
      {/* Sección Sobre Nosotros */}
      <div className="sobre-nosotros-header">
        <h1 className="sobre-nosotros-title">
          Sobre
          <span className="nosotros">Nosotros</span>
        </h1>
        
        <div className="sobre-nosotros-content">
          <p className="sobre-nosotros-description">
            <span className="highlight">SeqUOH</span> es el laboratorio de secuenciación de la{' '}
            <span className="highlight">Universidad de O'Higgins</span> perteneciente al{' '}
            <span className="highlight">Centro UOH de Bioingeniería (CUBI)</span>, especializado en genética 
            molecular y análisis genético de vanguardia. Ofrecemos{' '}
            <span className="highlight">servicios de secuenciación genética, análisis de ADN</span> y{' '}
            <span className="highlight">coaching genómico</span> para investigadores, universidades, hospitales y personas naturales.
          </p>
        </div>
      </div>

      {/* Sección Equipo */}
      <div className="equipo-section">
        <h2 className="equipo-title">
          <span>Equipo</span>
        </h2>
        
        <div className="equipo-grid">
          {equipoMiembros.map((miembro) => (
            <div key={miembro.id} className="miembro-card">
              <div className={`miembro-imagen ${miembro.imagen}`}></div>
              <div className="miembro-info">
                <h3 className="miembro-nombre">{miembro.nombre}</h3>
                <p className="miembro-cargo">{miembro.cargo}</p>
                <a 
                  href={miembro.linkedin} 
                  className="linkedin-btn"
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={`Ver perfil de LinkedIn de ${miembro.nombre}`}
                >
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SobreNosotros;