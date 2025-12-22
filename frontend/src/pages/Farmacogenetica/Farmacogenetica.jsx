import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Heart,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Info,
  Activity,
  Zap
} from 'lucide-react';

import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import DrugBar from '../../components/DrugBar/DrugBar';
import SunburstChart from '../../components/SunburstChart/SunburstChart';
import { cn } from '../../lib/utils';
import "./Farmacogenetica.css";

const farmacoPriorityConfig = {
  alto: {
    icon: AlertCircle,
    bgColor: "rgba(239, 68, 68, 0.1)",
    accentColor: "#ef4444",
    label: "Impacto Alto"
  },
  medio: {
    icon: AlertTriangle,
    bgColor: "rgba(245, 158, 11, 0.1)",
    accentColor: "#f59e0b",
    label: "Impacto Medio"
  },
  bajo: {
    icon: Info,
    bgColor: "rgba(16, 185, 129, 0.1)",
    accentColor: "#10b981",
    label: "Impacto Bajo"
  },
};

const ImpactSummaryCard = ({ level, count }) => {
  const config = farmacoPriorityConfig[level];
  const Icon = config.icon;

  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: '1.25rem',
      borderRadius: '1rem',
      border: `1px solid ${config.accentColor}33`,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: `0 4px 12px ${config.accentColor}11`
    }}>
      <div style={{ 
        backgroundColor: config.bgColor,
        padding: '0.75rem',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={20} color={config.accentColor} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{config.label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: config.accentColor }}>{count}</div>
      </div>
    </div>
  );
};

const Farmacogenetica = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const [expandedGroups, setExpandedGroups] = useState({});
  const [pharmaData, setPharmaData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colores vibrantes por sistema
  const systemColors = {
    'Cardiología': '#3b82f6', // Azul brillante
    'Salud Mental y Neurología': '#8b5cf6', // Violeta
    'Gastroenterología': '#10b981', // Esmeralda
    'Salud Ósea y Reumatología': '#f59e0b', // Ámbar
    'Oncología': '#ef4444', // Rojo Coral
  };

  const getImpactLevel = (magnitud) => {
    if (magnitud >= 2.5) return 'alto';
    if (magnitud >= 1.5) return 'medio';
    return 'bajo';
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const fetchUser = async () => {
    const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
    if (response.ok && response.data) {
      setUser(response.data.user || response.data);
    }
  };

  useEffect(() => {
    const fetchPharmaData = async () => {
      try {
        const response = await apiRequest(API_ENDPOINTS.PHARMACOGENETICS, { method: 'GET' });
        if (response.ok && response.data && response.data.data) {
          // Asignar colores si el backend no los trae o queremos sobreescribirlos por estética
          const enhancedData = response.data.data.map(sys => ({
            ...sys,
            color: systemColors[sys.name] || '#64748b'
          }));
          setPharmaData(enhancedData);
        }
      } catch (error) {
        console.error('Error al obtener farmacogenética:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPharmaData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try { await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' }); } catch (e) {}
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

  const riskSummary = useMemo(() => {
    let alto = 0, medio = 0, bajo = 0;
    pharmaData.forEach(sys => {
      sys.drugs.forEach(drug => {
        const level = getImpactLevel(drug.magnitud);
        if (level === 'alto') alto++;
        else if (level === 'medio') medio++;
        else bajo++;
      });
    });
    return { alto, medio, bajo };
  }, [pharmaData]);

  return (
    <div className="farmacogenetica-dashboard">
      {isMobile && (
        <button className="farmacogenetica-dashboard__burger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <aside className="farmacogenetica-dashboard__sidebar">
        <Sidebar
          items={sidebarItems}
          onLogout={handleLogout}
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="farmacogenetica-dashboard__main">
        <div className="farmacogenetica-page">
          <SectionHeader
            title="Farmacogenética"
            subtitle="Análisis de cómo tus variantes genéticas afectan la respuesta a medicamentos clasificados por sistemas médicos."
            icon={Zap}
          />

          <div className="farmacogenetica-content-wrapper">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', width: '100%' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
              </div>
            ) : (
              <>
                <section className="farmacogenetica-left">
                  <div className="impact-cards">
                    <ImpactSummaryCard level="alto" count={riskSummary.alto} />
                    <ImpactSummaryCard level="medio" count={riskSummary.medio} />
                    <ImpactSummaryCard level="bajo" count={riskSummary.bajo} />
                  </div>

                  <div className="profiles-grid">
                    {pharmaData.map((system, index) => (
                      <div key={index} className="profile-card" style={{ '--group-color': system.color }}>
                        <div className="profile-info" onClick={() => toggleGroup(system.name)} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>{system.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: system.color, backgroundColor: `${system.color}11`, padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
                                {system.drugs.length} fármacos
                              </span>
                              <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", expandedGroups[system.name] && "rotate-180")} />
                            </div>
                          </div>
                          <p>{system.role}</p>
                        </div>

                        {expandedGroups[system.name] && (
                          <div className="drug-list">
                            {system.drugs.map((drug, dIdx) => (
                              <DrugBar
                                key={dIdx}
                                drug={drug}
                                systemColor={system.color}
                                impactDisplayColor={farmacoPriorityConfig[getImpactLevel(drug.magnitud)].accentColor}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <aside className="farmacogenetica-right">
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Distribución de Respuesta</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Interactúa con los anillos para ver detalles</p>
                  </div>
                  <SunburstChart data={pharmaData} />
                </aside>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Farmacogenetica;