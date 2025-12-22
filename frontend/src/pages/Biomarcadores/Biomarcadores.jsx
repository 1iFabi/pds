import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Info, Activity, TrendingUp, MapPin, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import SemiGauge from '../../components/SemiGauge/SemiGauge';
import BiomarkerStats from '../../components/BiomarkerStats/BiomarkerStats';
import './Biomarcadores.css';

const Biomarcadores = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [showOnlyUser, setShowOnlyUser] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [totalBiomarcadores, setTotalBiomarcadores] = useState(0); // New state variable
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchTotalBiomarcadores(); // Call the new fetch function
  }, []);

  const fetchTotalBiomarcadores = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.BIOMARKERS_TOTAL, { method: 'GET' });
      if (response.ok && response.data && response.data.total) {
        setTotalBiomarcadores(response.data.total);
      } else {
        console.error('Failed to fetch total biomarkers:', response.data);
      }
    } catch (error) {
      console.error('Error fetching total biomarkers:', error);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchUser = async () => {
    const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
    if (response.ok && response.data) {
      setUser(response.data.user || response.data);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
    clearToken();
    navigate('/');
  };

  const sidebarItems = useMemo(() => [
    { label: 'Ancestría', href: '/dashboard/ancestria' },
    { label: 'Rasgos', href: '/dashboard/rasgos' },
    { label: 'Farmacogenética', href: '/dashboard/farmacogenetica' },
    { label: 'Biomarcadores', href: '/dashboard/biomarcadores' },
    { label: 'Biométricas', href: '/dashboard/biometricas' },
    { label: 'Enfermedades', href: '/dashboard/enfermedades' },
  ], []);

  // Datos de ejemplo
  const biomarkers = [
    {
      id: 'rs1800896',
      gene: 'IL10',
      name: 'Interleucina-10',
      chromosome: '1',
      position: '206773552',
      userGenotype: 'C/C',
      alleles: { ref: 'C', alt: 'T' },
      userResult: {
        genotype: 'C/C',
        phenotype: 'Producción normal de interleucina-10',
        risk: 'bajo',
        magnitude: 1,
        frequency: 0.5234,
        continent: 'AMR',
        country: 'México'
      },
      allGenotypes: [
        { genotype: 'C/C', phenotype: 'Producción normal de interleucina-10', risk: 'bajo', frequency: 0.5234 },
        { genotype: 'C/T', phenotype: 'Respuesta inmune intermedia', risk: 'medio', frequency: 0.2345 },
        { genotype: 'T/T', phenotype: 'Menor producción de interleucina-10', risk: 'alto', frequency: 0.2421 }
      ]
    },
    {
      id: 'rs6152',
      gene: 'GH1',
      name: 'Hormona de Crecimiento',
      chromosome: 'Y',
      position: 'N/A',
      userGenotype: 'G/A',
      alleles: { ref: 'G', alt: 'A' },
      userResult: {
        genotype: 'G/A',
        phenotype: 'Niveles intermedios de hormona de crecimiento (GH1)',
        risk: 'medio',
        magnitude: 3,
        frequency: 0.3421,
        continent: 'AFR',
        country: 'Nigeria'
      },
      allGenotypes: [
        { genotype: 'G/G', phenotype: 'Niveles normales de hormona de crecimiento', risk: 'bajo', frequency: 0.4234 },
        { genotype: 'G/A', phenotype: 'Niveles intermedios de hormona de crecimiento', risk: 'medio', frequency: 0.3421 },
        { genotype: 'A/A', phenotype: 'Niveles elevados de hormona de crecimiento', risk: 'alto', frequency: 0.2345 }
      ]
    },
    {
      id: 'rs1234567',
      gene: 'APOE',
      name: 'Apolipoproteína E',
      chromosome: '17',
      position: '44908684',
      userGenotype: 'T/T',
      alleles: { ref: 'C', alt: 'T' },
      userResult: {
        genotype: 'T/T',
        phenotype: 'Mayor riesgo de enfermedad de Alzheimer',
        risk: 'alto',
        magnitude: 4,
        frequency: 0.1500,
        continent: 'EUR',
        country: 'España'
      },
      allGenotypes: [
        { genotype: 'C/C', phenotype: 'Riesgo típico de enfermedad de Alzheimer', risk: 'bajo', frequency: 0.7000 },
        { genotype: 'C/T', phenotype: 'Riesgo moderado de enfermedad de Alzheimer', risk: 'medio', frequency: 0.1500 },
        { genotype: 'T/T', phenotype: 'Mayor riesgo de enfermedad de Alzheimer', risk: 'alto', frequency: 0.1500 }
      ]
    }
  ];

  const riskDistribution = useMemo(() => {
    const counts = {
      bajo: 0,
      medio: 0,
      alto: 0
    };
    biomarkers.forEach(bio => {
      if (counts[bio.userResult.risk] !== undefined) {
        counts[bio.userResult.risk]++;
      }
    });
    return counts;
  }, [biomarkers]);

  const getRiskClass = (risk) => {
    const classes = {
      bajo: 'risk-bajo',
      medio: 'risk-medio',
      alto: 'risk-alto'
    };
    return classes[risk] || 'risk-default';
  };

  const biomarkerRiskConfig = {
    alto: { color: '#8b5cf6' },
    medio: { color: '#06b6d4' },
    bajo: { color: '#f59e0b' },
  };

  return (
    <div className="dashboard">
      {/* Burger button para móviles */}
      {isMobile && (
        <button
          className="dashboard__burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={24} strokeWidth={2.5} />
          ) : (
            <Menu size={24} strokeWidth={2.5} />
          )}
        </button>
      )}

      <aside className="dashboard__sidebar">
        <Sidebar
          items={sidebarItems}
          onLogout={handleLogout}
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="dashboard__main">
        <div className="biomarcador-container">
          <div className="biomarcador-wrapper">
            <SectionHeader
              title="Biomarcadores"
              subtitle="Resultados personalizados de tu análisis genético"
              icon={Globe}
            />
            <div className="gauge-info-container">
              <div className="highlight-on-hover">
                <SemiGauge data={riskDistribution} riskConfig={biomarkerRiskConfig} />
              </div>
              <div className="BiomarkerStats-wrapper highlight-on-hover">
                <BiomarkerStats />
              </div>
              <div className="footer-info highlight-on-hover">
                <h3 className="footer-title">Información sobre los resultados</h3>
                <p className="footer-text">
                  El gráfico muestra cómo se reparten los biomarcadores de tu perfil según su nivel de impacto: 
                  <span className="text-green"> bajo</span>, 
                  <span className="text-yellow"> medio</span> y 
                  <span className="text-red"> alto</span>; mientras mayor el impacto, mayor la relevancia o asociación según la evidencia utilizada. A la derecha, el resumen indica el alcance del análisis (<span className="text-bold">127 variantes genéticas</span> y <span className="text-bold">24 biomarcadores posibles</span>). En tu caso, el sistema muestra cuántos biomarcadores se encontraron asociados en tu perfil, un número que <span className="text-bold">puede variar entre personas</span>.
                </p>
              </div>
            </div>
            {/* Cards de biomarcadores */}
            <div className="cards-container">
              {biomarkers.map((bio) => (
                <div
                  key={bio.id}
                  className={`biomarker-card ${getRiskClass(bio.userResult.risk)}`}
                >
                  {/* Header de la card */}
                  <div className="card-content">
                    <div className="card-header">
                      <div className="card-info">
                        <div className="title-row">
                          <h2 className="card-title">{bio.name}</h2>

                        </div>
                        <p className="card-id">{bio.id} — {bio.gene}</p>
                        <p className="card-location">
                          Cromosoma {bio.chromosome} | Posición: {bio.position}
                        </p>
                      </div>
                      <div className={`result-badge ${getRiskClass(bio.userResult.risk)}`}>
                        TU RESULTADO: {bio.userGenotype}
                      </div>
                    </div>

                    {/* Fenotipo */}
                    <div className="phenotype-box">
                      <p className="phenotype-text">
                        <Activity size={20} className="icon-activity" />
                        {bio.userResult.phenotype}
                      </p>
                    </div>

                    {/* Medidor visual */}
                    <div className="gauge-container">
                      <div className="gauge-labels">
                        <span>Baja</span>
                        <span>Normal</span>
                        <span>Alta</span>
                      </div>
                      <div className="gauge-bar">
                        <div
                          className="gauge-indicator"
                        ></div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-header">
                          <TrendingUp size={16} className="stat-icon" />
                          <span className="stat-label">MAGNITUD</span>
                        </div>
                        <div className="magnitude-bars">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`magnitude-bar ${i < bio.userResult.magnitude ? 'active' : ''}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botón expandir */}
                    <button
                      onClick={() => setExpandedCard(expandedCard === bio.id ? null : bio.id)}
                      className="expand-button"
                    >
                      {expandedCard === bio.id ? (
                        <>
                          <ChevronUp size={20} />
                          Ocultar todos los genotipos
                        </>
                      ) : (
                        <>
                          <ChevronDown size={20} />
                          Ver todos los genotipos posibles
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tabla expandible */}
                  {expandedCard === bio.id && (
                    <div className="expanded-table">
                      <div className="table-wrapper">
                        <table className="genotypes-table">
                          <thead>
                            <tr>
                              <th>Genotipo</th>
                              <th>Fenotipo</th>
                              <th>Nivel de Riesgo</th>
                              <th>Frecuencia</th>
                              <th>Tu Resultado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bio.allGenotypes.map((gen) => (
                              <tr
                                key={gen.genotype}
                                className={gen.genotype === bio.userGenotype ? 'user-row' : ''}
                              >
                                <td>
                                  <span className="genotype-code">{gen.genotype}</span>
                                </td>
                                <td>
                                  <span className="phenotype-desc">{gen.phenotype}</span>
                                </td>
                                <td>
                                  <span className={`risk-badge ${getRiskClass(gen.risk)}`}>
                                    {gen.risk.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <span className="frequency-value">{(gen.frequency * 100).toFixed(2)}%</span>
                                </td>
                                <td>
                                  {gen.genotype === bio.userGenotype && (
                                    <span className="checkmark">✓</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Biomarcadores;
