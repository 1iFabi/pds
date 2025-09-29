import React, { useState } from 'react';
import './Preguntas.css';

const Preguntas = () => {
  const [openIndices, setOpenIndices] = useState([]);

  const faqData = [
    {
      pregunta: '¿Qué tipo de pruebas genéticas realiza el servicio?',
      respuesta: 'Realizamos análisis genéticos completos que incluyen predisposición a enfermedades, farmacogenética, rasgos personales, ancestría étnica y compatibilidad nutricional. Nuestras pruebas analizan más de 700,000 marcadores genéticos para brindarte información integral sobre tu ADN.'
    },
    {
      pregunta: '¿Los resultados genéticos garantizan que desarrollaré la enfermedad indicada?',
      respuesta: 'No, los resultados genéticos indican predisposición o riesgo, no certeza. La genética es solo uno de los factores que influyen en tu salud. El estilo de vida, el ambiente y otros factores también son determinantes. Siempre recomendamos consultar con profesionales de la salud para interpretar correctamente los resultados.'
    },
    {
      pregunta: '¿Cuánto tiempo toma recibir los resultados de mi prueba genética?',
      respuesta: 'Una vez que recibimos tu muestra en nuestro laboratorio, el proceso de análisis toma entre 4 a 6 semanas. Te notificaremos por correo electrónico cuando tus resultados estén listos y podrás acceder a ellos a través de nuestra plataforma web segura.'
    },
    {
      pregunta: '¿Mis resultados genéticos están seguros y protegidos?',
      respuesta: 'Sí, la seguridad de tu información genética es nuestra máxima prioridad. Utilizamos encriptación de grado militar, cumplimos con estándares internacionales de protección de datos y nunca compartimos tu información personal con terceros sin tu consentimiento explícito.'
    },
    {
      pregunta: '¿Puedo hacer cambios en mi estilo de vida basados en los resultados de la prueba genética?',
      respuesta: 'Los resultados pueden proporcionar información valiosa para personalizar tu estilo de vida, especialmente en áreas como nutrición y ejercicio. Sin embargo, recomendamos siempre consultar con profesionales de la salud antes de hacer cambios significativos en tu dieta, rutina de ejercicios o medicamentos.'
    },
    {
      pregunta: '¿Puedo compartir mis resultados con familiares o con mi médico?',
      respuesta: 'Absolutamente. Puedes descargar e imprimir tus resultados para compartirlos con tu médico, nutricionista u otros profesionales de la salud. También puedes compartir información relevante con familiares, ya que algunos hallazgos genéticos pueden ser importantes para la salud familiar.'
    },
    {
      pregunta: '¿Qué tipos de ancestros se pueden identificar con el análisis genético?',
      respuesta: 'Nuestro análisis de ancestría puede identificar tu composición étnica a través de más de 1,000 regiones geográficas worldwide. Incluimos ancestría europea, africana, asiática, nativa americana y oceánica, con subdivisiones específicas por países y regiones para darte un panorama detallado de tus orígenes.'
    },
    {
      pregunta: '¿Las pruebas genéticas cubren todas las mutaciones posibles?',
      respuesta: 'Nuestras pruebas cubren las variaciones genéticas más relevantes y estudiadas científicamente. Analizamos cientos de miles de marcadores genéticos, pero no todas las mutaciones posibles. La ciencia genética está en constante evolución, por lo que actualizamos regularmente nuestros análisis con los últimos descubrimientos científicos.'
    }
  ];

  const handleToggle = (index) => {
    setOpenIndices(prevIndices => {
      const isCurrentlyOpen = prevIndices.includes(index);

      if (isCurrentlyOpen) {
        return prevIndices.filter(i => i !== index);
      } else {
        return [...prevIndices, index];
      }
    });
  };

  return (
    <section 
      id="preguntas"
      className="preguntas-section"
      data-nav-theme="brand"
    >
      <h1 className="title">Preguntas Frecuentes</h1>
      <p className="subtitle">
        Hemos recolectado las preguntas más populares para ayudarte a navegar
        correctamente. Escoge la pregunta que te interesa:
      </p>

      <div className="preguntas-grid">
        {faqData.map((item, index) => {
          const isOpen = openIndices.includes(index);

          return (
            <div 
              key={index} 
              className={`pregunta-card ${isOpen ? 'open' : ''}`}
            >
              <div 
                className="pregunta-header" 
                onClick={() => handleToggle(index)}
              >
                <span className="pregunta-text">{item.pregunta}</span>
                <div className="expand-btn">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    // CAMBIO: Añadimos la clase 'rotated' al SVG contenedor
                    // para girar todo el icono ligeramente.
                    className={isOpen ? 'rotated' : ''}
                  >
                    <circle cx="12" cy="12" r="10" fill="white"/>
                    <path 
                      d="M8 12h8" 
                      stroke="#277EAF" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M12 8v8" 
                      stroke="#277EAF" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      // CAMBIO CLAVE: Aplicamos la clase 'collapsed-path'
                      className={isOpen ? 'collapsed-path' : ''} 
                    />
                  </svg>
                </div>
              </div>
              
              {isOpen && (
                <div className="pregunta-content">
                  <p>{item.respuesta}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Preguntas;