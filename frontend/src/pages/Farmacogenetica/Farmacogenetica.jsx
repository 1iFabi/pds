import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Heart,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import DrugBar from '../../components/DrugBar/DrugBar';
import SunburstChart from '../../components/SunburstChart/SunburstChart';
import { cn } from '../../lib/utils';
import "./Farmacogenetica.css";

const farmacoPriorityConfig = {
  high: { icon: AlertCircle, bgColor: "bg-red-50", accentColor: "text-red-600", iconBgColor: "bg-red-100" },
  medium: { icon: AlertTriangle, bgColor: "bg-yellow-50", accentColor: "text-yellow-600", iconBgColor: "bg-yellow-100" },
  low: { icon: Info, bgColor: "bg-green-50", accentColor: "text-green-600", iconBgColor: "bg-green-100" },
};

const ImpactSummaryCard = ({ level, title, count }) => {
  const config = farmacoPriorityConfig[level];
  const Icon = config.icon;

  return (
    <div className={cn("p-2 rounded-2xl flex items-center gap-2", config.bgColor)}>
      <div className={cn("p-1 rounded-lg", config.iconBgColor)}>
        <Icon className={cn("w-4 h-4", config.accentColor)} />
      </div>
      <div>
        <h3 className={cn("text-sm font-semibold", config.accentColor)}>{title}</h3>
        <p className={cn("text-lg", config.accentColor, "opacity-90")}>
          {count} {count === 1 ? "farmaco" : "farmacos"}
        </p>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState('todos');

  const [pharmaData, setPharmaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchPharmaData = async () => {
    setError(null);
    try {
      const response = await apiRequest(API_ENDPOINTS.PHARMACOGENETICS, { method: 'GET' });
      if (response.ok && response.data && response.data.data) {
        setPharmaData(response.data.data);
      } else {
        setError('No se encontraron datos de farmacogenetica.');
        setPharmaData([]);
      }
    } catch (err) {
      setError('Error al obtener farmacogenetica.');
      setPharmaData([]);
    } finally {
      setLoading(false);
    }
  };

  const impactColors = {
    alto: '#ef4444',
    medio: '#f59e0b',
    bajo: '#047857',
  };

  const getImpactLevel = (magnitud) => {
    if (magnitud >= 3) return 'alto';
    if (magnitud >= 2) return 'medio';
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
    fetchPharmaData();
  }, []);

  useEffect(() => {
    fetchUser();
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
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesion', error);
    }
    clearToken();
    navigate('/');
  };

  const sidebarItems = useMemo(() => [
    { label: 'Ancestria', href: '/dashboard/ancestria' },
    { label: 'Rasgos', href: '/dashboard/rasgos' },
    { label: 'Farmacogenetica', href: '/dashboard/farmacogenetica' },
    { label: 'Biomarcadores', href: '/dashboard/biomarcadores' },
    { label: 'Biometricas', href: '/dashboard/biometricas' },
    { label: 'Enfermedades', href: '/dashboard/enfermedades' },
  ], []);

  const filteredSystems = useMemo(() => {
    if (!pharmaData) return [];
    const lower = searchTerm.toLowerCase();

    return pharmaData
      .map(system => {
        const filteredDrugs = (system.drugs || []).filter(drug => {
          const impactLevel = getImpactLevel(drug.magnitud);
          const matchesImpact = impactFilter === 'todos' || impactLevel === impactFilter;
          const matchesSearch =
            system.name.toLowerCase().includes(lower) || drug.name.toLowerCase().includes(lower);

          return matchesImpact && matchesSearch;
        });
        return { ...system, drugs: filteredDrugs };
      })
      .filter(system => (system.drugs || []).length > 0);
  }, [searchTerm, impactFilter, pharmaData]);

  const riskSummary = useMemo(() => {
    let high = 0, medium = 0, low = 0;

    (pharmaData || []).forEach(system => {
      (system.drugs || []).forEach(drug => {
        const impactLevel = getImpactLevel(drug.magnitud);
        if (impactLevel === 'alto') high++;
        else if (impactLevel === 'medio') medium++;
        else low++;
      });
    });

    return { high, medium, low };
  }, [pharmaData]);

  if (!loading && !error && pharmaData.length === 0) {
    return (
      <div className="farmacogenetica-dashboard">
        <main className="farmacogenetica-dashboard__main">
          <div className="text-center p-8">No hay datos farmacogeneticos para este usuario.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="farmacogenetica-dashboard">
      {isMobile && (
        <button
          className="farmacogenetica-dashboard__burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
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
            title="Farmacogenetica"
            subtitle="Hemos dividido los farmacos en cinco sistemas. Explora como tu genetica influye en la eficacia y los efectos secundarios de los medicamentos en cada sistema."
            icon={Heart}
          />

          <div className="farmacogenetica-content-wrapper">
            {loading ? (
              <div className="text-center p-8">Cargando...</div>
            ) : error ? (
              <div className="text-center p-8">
                <p>{error}</p>
                <button className="filter-btn" onClick={() => { setLoading(true); fetchPharmaData(); }}>
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {/* DERECHA */}
                <aside className="farmacogenetica-right">
                  {pharmaData.length ? (
                    <SunburstChart data={pharmaData} />
                  ) : (
                    <div className="text-center p-6 text-gray-600">No hay datos farmacogeneticos para mostrar.</div>
                  )}
                </aside>

                {/* IZQUIERDA */}
                <section className="farmacogenetica-left">
                  <div className="impact-cards">
                    <ImpactSummaryCard level="high" title="Impacto Alto" count={riskSummary.high} />
                    <ImpactSummaryCard level="medium" title="Impacto Medio" count={riskSummary.medium} />
                    <ImpactSummaryCard level="low" title="Impacto Bajo" count={riskSummary.low} />
                  </div>

                  <div className="profiles-grid">
                    {filteredSystems.map((system, index) => (
                      <div
                        key={index}
                        className="profile-card"
                        style={{ '--group-color': system.color }}
                      >
                        <div
                          className="profile-info"
                          onClick={() => toggleGroup(system.name)}
                          style={{ cursor: 'pointer', width: '100%' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>{system.name}</h3>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
                                expandedGroups[system.name] ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                          <p>{system.role}</p>
                        </div>

                        {expandedGroups[system.name] && (
                          <div className="drug-list">
                            {system.drugs.map((drug, drugIndex) => {
                              const impactLevel = getImpactLevel(drug.magnitud);
                              return (
                                <DrugBar
                                  key={drugIndex}
                                  drug={drug}
                                  systemColor={system.color}
                                  impactDisplayColor={impactColors[impactLevel]}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Farmacogenetica;
