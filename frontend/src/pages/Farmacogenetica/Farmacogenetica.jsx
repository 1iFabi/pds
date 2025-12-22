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
  high: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    accentColor: "text-red-600",
    iconBgColor: "bg-red-100",
  },
  medium: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    accentColor: "text-yellow-600",
    iconBgColor: "bg-yellow-100",
  },
  low: {
    icon: Info,
    bgColor: "bg-green-50",
    accentColor: "text-green-600",
    iconBgColor: "bg-green-100",
  },
};

// fallback
const systems = [
  {
    name: 'Cardiología',
    role: 'Fármacos que afectan el corazón y los vasos sanguíneos.',
    color: '#F48FB1',
    drugs: [
      { name: 'Warfarina', percentage: 75, rsid: 'rs9923231', cromosoma: '16', posicion: '31106951', genotipo: 'C/T', magnitud: 3.2 },
      { name: 'Clopidogrel', percentage: 45, rsid: 'rs4244285', cromosoma: '10', posicion: '96533169', genotipo: 'G/A', magnitud: 2.8 },
      { name: 'Simvastatina', percentage: 50, rsid: 'rs1234567', cromosoma: '1', posicion: '12345678', genotipo: 'A/A', magnitud: 2.5 },
    ]
  },
  {
    name: 'Salud Mental y Neurología',
    role: 'Fármacos que actúan sobre el sistema nervioso central.',
    color: '#00BCD4',
    drugs: [
      { name: 'Amitriptilina', percentage: 60, rsid: 'rs2292566', cromosoma: '22', posicion: '42129929', genotipo: 'A/G', magnitud: 2.1 },
    ]
  },
  {
    name: 'Gastroenterología',
    role: 'Fármacos para el tratamiento de afecciones digestivas.',
    color: '#9C27B0',
    drugs: [
      { name: 'Omeprazol', percentage: 80, rsid: 'rs4986893', cromosoma: '10', posicion: '96533169', genotipo: 'C/T', magnitud: 1.5 },
    ]
  },
  {
    name: 'Salud Ósea y Reumatología',
    role: 'Fármacos para el fortalecimiento óseo y afecciones articulares.',
    color: '#3F51B5',
    drugs: [
      { name: 'Alendronato', percentage: 65, rsid: 'rs7654321', cromosoma: '5', posicion: '87654321', genotipo: 'G/G', magnitud: 2.0 },
    ]
  },
  {
    name: 'Oncología',
    role: 'Fármacos utilizados en el tratamiento del cáncer.',
    color: '#FF5722',
    drugs: []
  },
];

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
          {count} {count === 1 ? "fármaco" : "fármacos"}
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

  // fetch user
  const fetchUser = async () => {
    const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
    if (response.ok && response.data) {
      setUser(response.data.user || response.data);
    }
  };

  // fetch pharma data
  useEffect(() => {
    const fetchPharmaData = async () => {
      try {
        const response = await apiRequest(API_ENDPOINTS.PHARMACOGENETICS, { method: 'GET' });
        if (
          response.ok &&
          response.data &&
          response.data.data
        ) {
          setPharmaData(response.data.data);
        } else {
          console.error("No se encontraron datos de farmacogenética o hubo un error. Usando fallback.");
          setPharmaData(systems);
        }
      } catch (error) {
        console.error('Error al obtener farmacogenética. Usando fallback:', error);
        setPharmaData(systems);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmaData();
  }, []);

  // mount user + mobile check
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

  return (
    <div className="farmacogenetica-dashboard">
      {isMobile && (
        <button
          className="farmacogenetica-dashboard__burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
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
            title="Farmacogenética"
            subtitle="Hemos dividido los fármacos en cinco sistemas: Cardiología, Salud mental y neurología, Gastroenterología, Salud ósea y reumatología, y Oncología. Explora cómo tu genética influye en la eficacia y los efectos secundarios de los medicamentos en cada sistema."
            icon={Heart}
          />

          <div className="farmacogenetica-content-wrapper">
            {loading ? (
              <div className="text-center p-8">Cargando...</div>
            ) : (
              <>
                {/* DERECHA */}
                <aside className="farmacogenetica-right">
                  <SunburstChart data={pharmaData} />
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
