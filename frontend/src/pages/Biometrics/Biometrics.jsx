import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, ChevronDown, Sparkles, Menu, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import NalaTipButton from '../../components/Nala/NalaTipButton';
import './Biometrics.css';

const Biometrics = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [biometrics, setBiometrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchBiometrics();
    setTimeout(() => setAnimate(true), 100);
  }, []);

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

  const fetchBiometrics = async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest(API_ENDPOINTS.BIOMETRICS, { method: 'GET' });

    if (response.ok && response.data) {
      const payload = response.data.data || response.data;
      if (payload?.matrix || payload?.variants) {
        setBiometrics(payload);
      } else {
        setError('No hay datos biometrico-geneticos disponibles.');
      }
    } else {
      setError('No se pudieron cargar tus biometrias. Intenta nuevamente.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesion', err);
    }
    clearToken();
    navigate('/');
  };

  const sidebarItems = useMemo(
    () => [
      { label: 'Ancestria', href: '/dashboard/ancestria' },
      { label: 'Rasgos', href: '/dashboard/rasgos' },
      { label: 'Farmacogenetica', href: '/dashboard/farmacogenetica' },
      { label: 'Biomarcadores', href: '/dashboard/biomarcadores' },
      { label: 'Biometricas', href: '/dashboard/biometricas' },
      { label: 'Enfermedades', href: '/dashboard/enfermedades' },
    ],
    []
  );

  const impactScore = (impact) => {
    if (impact === 'high') return 3;
    if (impact === 'medium') return 2;
    return 1;
  };

  const impactLabel = (impact) => {
    if (impact === 'high') return 'Alto';
    if (impact === 'medium') return 'Intermedio';
    return 'Bajo';
  };

  const getColor = (impact) => {
    if (impact === 'high') return '#ef4444';
    if (impact === 'medium') return '#f59e0b'; // Amarillo
    return '#10b981';
  };

  const formatFrequency = (value) => {
    if (value === null || value === undefined || value === '') return 'N/D';
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 'N/D';
    const percent = parsed <= 1 ? parsed * 100 : parsed;
    return `${percent.toFixed(2)}%`;
  };

  const variants = useMemo(() => {
    if (biometrics?.variants?.length) {
      return biometrics.variants.map((v, idx) => ({
        id: `${v.rsid || 'var'}-${v.genotipo || idx}-${idx}`,
        rsid: v.rsid || 'NA',
        genotipo: v.genotipo || 'NA',
        fenotipo: v.fenotipo || v.explanation || 'Variante',
        cromosoma: v.cromosoma || '',
        posicion: v.posicion || '',
        categoria: v.categoria || v.grupo || '',
        magnitud: typeof v.magnitud_efecto === 'number' ? v.magnitud_efecto : null,
        impact: v.impact || 'low',
        freq_chile_percent: v.freq_chile_percent,
        explanation: v.phenotype_description || v.explanation || v.fenotipo || 'Sin detalles.',
      }));
    }

    if (biometrics?.matrix) {
      return biometrics.matrix.flatMap((row, rIdx) =>
        (row.cells || []).map((cell, idx) => ({
          id: `${row.name}-${cell.column}-${idx}`,
          rsid: cell.explanation?.split(':').pop()?.trim() || `Cell-${rIdx}-${idx}`,
          genotipo: '',
          fenotipo: `${row.name} - ${cell.column}`,
          cromosoma: '',
          posicion: '',
          categoria: row.name,
          magnitud: null,
          impact: cell.impact || 'low',
          explanation: cell.explanation || 'Sin detalles.',
        }))
      );
    }

    return [];
  }, [biometrics]);

  const avgImpact = useMemo(() => {
    if (!variants.length) return '0.0';
    return (
      variants.reduce((sum, item) => sum + impactScore(item.impact), 0) /
      variants.length
    ).toFixed(1);
  }, [variants]);

  const totalsByImpact = useMemo(() => {
    return variants.reduce(
      (acc, cell) => {
        acc[cell.impact] = (acc[cell.impact] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
  }, [variants]);

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="biometrics-layout">
      {/* Burger button para moviles */}
      <button
        className="biometrics-layout__burger"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
        style={{ display: isMobile ? 'flex' : 'none' }}
      >
        {isMobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
      </button>

      <aside className={`biometrics-layout__sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar
          items={sidebarItems}
          onLogout={handleLogout}
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="biometrics-layout__main">
        <div className="biometrics-page">
          <SectionHeader
            title="Biométricas"
            subtitle="Analisis de tus predisposiciones geneticas segun datos biometricos"
            icon={Dna}
          />

          {loading && (
            <div className="biometrics-page__loading">
              <div className="spinner" />
              <p>Cargando biometrias personalizadas...</p>
            </div>
          )}

          {!loading && error && (
            <div className="biometrics-page__error">
              <p>{error}</p>
              <button onClick={fetchBiometrics}>Reintentar</button>
            </div>
          )}

          {!loading && !error && (
            <div className="biometrics-page__content">
              {/* Resumen Global */}
              <div className="bio-summary-card">
                <div className="bio-summary-title">
                  <h3>Resumen Global de Factores</h3>
                </div>
                <div className="bio-summary-grid">
                  {[
                    {
                      label: 'Promedio impacto',
                      value: avgImpact,
                      fixedColor: null,
                      description: 'Promedio de los impactos de todas tus variantes biometrico-geneticas.'
                    },
                    {
                      label: 'Impacto alto',
                      value: totalsByImpact.high,
                      fixedColor: '#ef4444',
                      description: 'Cantidad de variantes con impacto alto segun magnitud/efecto.'
                    },
                    {
                      label: 'Impacto medio',
                      value: totalsByImpact.medium,
                      fixedColor: '#f59e0b',
                      description: 'Cantidad de variantes con impacto medio.'
                    },
                    {
                      label: 'Impacto bajo',
                      value: totalsByImpact.low,
                      fixedColor: '#10b981',
                      description: 'Cantidad de variantes con impacto bajo.'
                    },
                  ].map(({ label, value, fixedColor, description }) => {
                    const numericValue = typeof value === 'number' ? value : parseFloat(value);
                    const percentage = (Math.min(numericValue, 3) / 3) * 100;
                    
                    let color = fixedColor;
                    if (!color) {
                       color = numericValue >= 2.5 ? '#ef4444' : numericValue >= 1.5 ? '#f59e0b' : '#10b981';
                    }

                    return (
                      <div
                        key={label}
                        className="circular-stat"
                        onMouseEnter={() => setHoveredMetric(label)}
                        onMouseLeave={() => setHoveredMetric(null)}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '100px',
                            height: '100px',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke={color}
                              strokeWidth="8"
                              strokeDasharray={`${(percentage / 100) * 264} 264`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dasharray 0.6s ease' }}
                            />
                          </svg>
                          <div className="circular-stat__value" style={{ color: color, fontSize: '1.5rem' }}>
                            {value}
                          </div>
                        </div>
                        <div className="circular-stat__label">{label}</div>
                        {hoveredMetric === label && (
                          <div className="circular-stat__tooltip">
                            {description}
                            <span className="circular-stat__tooltip-arrow" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de variantes */}
              <div className="bio-traits-list">
                {variants.map((item, index) => {
                  const isExpanded = expandedCards[item.id];
                  const color = getColor(item.impact);
                  const baseScore = impactScore(item.impact);
                  const percentage =
                    item.magnitud && !Number.isNaN(item.magnitud)
                      ? Math.min(Math.round((item.magnitud / 3) * 100), 100)
                      : (baseScore / 3) * 100;

                  const nalaQueries = {
                    rsid: item.rsid ? `¿Qué es un rsID? (${item.rsid})` : "rsid",
                    genotype: item.genotipo ? `¿Qué significa el genotipo ${item.genotipo}?` : "genotipo",
                    impacto: item.impact ? `¿Qué significa impacto ${impactLabel(item.impact)}?` : "impacto",
                    cromopos: "¿Qué significa cromosoma y posición?",
                    categoria: item.categoria ? `¿Qué significa la categoría ${item.categoria}?` : "categoría",
                    magnitud:
                      item.magnitud !== null && item.magnitud !== undefined
                        ? `¿Qué significa magnitud ${item.magnitud}?`
                        : "magnitud",
                  };

                  return (
                    <div key={item.id} className={`trait-bar ${isExpanded ? 'trait-bar--open' : ''}`}>
                      {/* Header */}
                      <div className="trait-bar__main-info" onClick={() => toggleCard(item.id)}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.75rem',
                            gap: '1rem',
                          }}
                        >
                          <h3 className="trait-bar__name" style={{ flex: 1, margin: 0 }}>
                            {item.fenotipo}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                              {item.rsid}
                            </span>
                            {item.genotipo && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: '#0b7ad0',
                                  background: '#e0f2fe',
                                  padding: '4px 8px',
                                  borderRadius: '999px',
                                }}
                              >
                                {item.genotipo}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              color,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {percentage.toFixed(0)}% ({impactLabel(item.impact)})
                          </span>
                        </div>

                        {/* Barra de progreso */}
                        <div
                          style={{
                            width: '100%',
                            height: '8px',
                            background: '#f3f4f6',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: animate ? `${percentage}%` : '0%',
                              background: color,
                              borderRadius: '999px',
                              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                              transitionDelay: `${index * 0.05}s`,
                            }}
                          />
                        </div>

                        {/* Boton toggle */}
                        <button
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <span>Ver mas informacion</span>
                          <ChevronDown
                            size={16}
                            style={{
                              transition: 'transform 0.3s ease',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          />
                        </button>
                      </div>

                      {/* Contenido expandido */}
                      {isExpanded && (
                        <div className="trait-bar__details">
                          {/* Detalle */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4>DETALLE</h4>
                            <div
                              className="grid"
                              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                            >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    RS ID
                                  </span>
                                  <NalaTipButton query={nalaQueries.rsid} ariaLabel="Pregúntale a Nala sobre RS ID" />
                                </div>
                                <span style={{ color: '#1e293b', fontWeight: '700' }}>{item.rsid}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    Genotipo
                                  </span>
                                  <NalaTipButton query={nalaQueries.genotype} ariaLabel="Pregúntale a Nala sobre genotipo" />
                                </div>
                                <span style={{ color: '#1e293b', fontWeight: '700' }}>{item.genotipo || 'NA'}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    Impacto
                                  </span>
                                  <NalaTipButton query={nalaQueries.impacto} ariaLabel="Pregúntale a Nala sobre impacto" />
                                </div>
                                <span style={{ color, fontWeight: '700' }}>{impactLabel(item.impact)}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    Cromosoma / Posicion
                                  </span>
                                  <NalaTipButton query={nalaQueries.cromopos} ariaLabel="Pregúntale a Nala sobre cromosoma y posición" />
                                </div>
                                <span style={{ color: '#1e293b', fontWeight: '700' }}>
                                  {item.cromosoma || 'NA'} {item.posicion || ''}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    Categoria
                                  </span>
                                  <NalaTipButton query={nalaQueries.categoria} ariaLabel="Pregúntale a Nala sobre categoría" />
                                </div>
                                <span style={{ color: '#1e293b', fontWeight: '700' }}>
                                  {item.categoria || 'Sin categoria'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    Magnitud
                                  </span>
                                  <NalaTipButton query={nalaQueries.magnitud} ariaLabel="Pregúntale a Nala sobre magnitud" />
                                </div>
                                <span style={{ color: '#1e293b', fontWeight: '700' }}>
                                  {item.magnitud !== null && item.magnitud !== undefined ? item.magnitud : 'N/A'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div className="bio-detail-label-row">
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                    Frecuencia Chile
                                  </span>
                                </div>
                                <span style={{ color: '#1e293b', fontWeight: '700' }}>
                                  {formatFrequency(item.freq_chile_percent)}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                  Frecuencia estimada en poblacion chilena.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Analisis */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4>INTERPRETACION</h4>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '12px',
                              }}
                            >
                              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                                Intensidad estimada
                              </span>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3].map((level) => (
                                  <div
                                    key={level}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      background: impactScore(item.impact) >= level ? color : '#e2e8f0',
                                      boxShadow:
                                        impactScore(item.impact) >= level ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                                      transition: 'all 0.3s ease',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Explicacion */}
                          <div>
                            <h4>EXPLICACION</h4>
                            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{item.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!variants.length && (
                  <div className="biometrics-page__error">
                    <p>No encontramos biometrias para tu cuenta.</p>
                    <button onClick={fetchBiometrics}>Reintentar</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Biometrics;
