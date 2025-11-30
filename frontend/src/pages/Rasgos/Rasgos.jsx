import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Activity, ChevronDown, Zap, HelpCircle } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import Tooltip from '../../components/Tooltip/Tooltip';
import './Rasgos.css';

const glossaryData = [
  { term: 'RSID', description: 'Código único (ej: rs1234567) que identifica una variante específica en bases de datos científicas.' },
  { term: 'Magnitud', description: 'Escala (0-5) que mide la importancia clínica de una variante. Mayor valor = mayor impacto.' },
  { term: 'Alelo', description: 'Cada variante posible de un gen. Heredas una de cada progenitor.' },
  { term: 'Fenotipo', description: 'Características observables (p.ej., color de ojos). Surge de genes + ambiente.' },
  { term: 'Genotipo', description: 'Tu composición genética heredada de ambos progenitores.' },
  { term: 'Gen', description: 'Segmento de ADN con instrucciones para una proteína.' },
];

const groupDescriptions = {
  'Metabolismo': 'Rasgos asociados a las reacciones químicas del cuerpo para convertir alimentos en energía.',
  'Rendimiento Físico y Sensorial': 'Rasgos vinculados al desempeño físico y a cómo percibes y procesas estímulos.',
  'Cognición': 'Rasgos ligados a procesos mentales como pensamiento, aprendizaje, memoria y atención.',
  'Bienestar y Salud': 'Rasgos relacionados con el equilibrio físico, mental y social.',
  'Apariencia Física': 'Rasgos asociados a características externas como piel, cabello u ojos.',
};

function TraitBar({ trait = {}, name, percentage, delay = 0, groupColor }) {
  const [animate, setAnimate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getPercentageLabel = (pct) => {
    if (pct >= 61) return 'Alto';
    if (pct >= 31) return 'Medio';
    return 'Bajo';
  };
  const percentageLabel = getPercentageLabel(percentage);

  const rsId = trait.rsid || trait.rsId || trait.rsID || 'N/A';
  const cromosoma = trait.cromosoma || 'N/A';
  const posicion = trait.posicion || 'N/A';
  const genotipo = trait.genotipo || trait.genotype || 'N/A';
  const aleloRef = trait.alelo_referencia || trait.aleloReferencia || 'N/A';
  const aleloAlt = trait.alelo_alternativo || trait.aleloAlternativo || 'N/A';
  const magnitudeRaw = trait.magnitud_efecto ?? trait.magnitude ?? trait.effect_size;
  const magnitudeVal = parseFloat(magnitudeRaw);
  const magnitude = Number.isFinite(magnitudeVal) ? magnitudeVal.toFixed(1) : 'N/A';
  const magnitudePercent = Number.isFinite(magnitudeVal) ? Math.min(100, Math.max(0, (magnitudeVal / 5) * 100)) : 0;
  const isHighRisk = Number.isFinite(magnitudeVal) && magnitudeVal >= 3;

  return (
    <div className={`trait-bar ${isExpanded ? 'trait-bar--open' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className="text-sm font-semibold" style={{ color: groupColor }}>
          {percentage}% ({percentageLabel})
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: animate ? `${percentage}%` : '0%', backgroundColor: groupColor }}
        />
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 w-full flex justify-between items-center text-xs text-gray-500 hover:text-gray-700 transition-all duration-200"
      >
        <span>Ver mas información</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="trait-bar__details">
          <div className="trait-bar__details-inner text-sm text-gray-700">
            <div className="pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identificacion Genetica</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">RS ID:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{rsId}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Cromosoma:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{cromosoma}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Posicion:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{posicion}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Genotipo:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold bg-gray-100 px-2 py-1 rounded">{genotipo}</span>
                </div>
              </div>
            </div>

            <div className="pb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Analisis de Riesgo</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Magnitud de Efecto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {magnitude} <span className="text-sm text-gray-500 font-normal">/5.0</span>
                  </p>
                </div>
                {isHighRisk && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50">
                    <Zap className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-600">Alto Impacto</span>
                  </div>
                )}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${magnitudePercent}%`,
                    backgroundColor:
                      magnitude === 'N/A'
                        ? '#9CA3AF'
                        : magnitudeVal >= 4
                        ? '#ef4444'
                        : magnitudeVal >= 3
                        ? '#f59e0b'
                        : magnitudeVal >= 2
                        ? '#3b82f6'
                        : '#10b981',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupedActivityGauge({ groupedData }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart
          data={groupedData}
          innerRadius="30%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="value"
            cornerRadius={6}
          />
          <circle cx="50%" cy="50%" r="20%" fill="white" />
          <text x="50%" y="46.5%" textAnchor="middle" dominantBaseline="central">
            <tspan x="50%" dy="-0.1em" className="text-xs font-medium fill-gray-600">
              Grupos
            </tspan>
            <tspan x="50%" dy="1.1em" className="text-base font-bold fill-gray-900">
              {groupedData.length}
            </tspan>
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-col gap-2">
        {groupedData.map((group) => (
          <div key={group.name} className="flex items-center justify-between">
            <div className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: group.fill }}
              />
              <span className="text-sm text-gray-600">{group.name}</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{group.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlossaryCarousel() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c - 1 + glossaryData.length) % glossaryData.length);
  const next = () => setCurrent((c) => (c + 1) % glossaryData.length);

  return (
    <div className="card-pro card-small-pro glossary-pro">
      <div className="glossary-pro__content">
        <span className="glossary-pro__badge">GLOSARIO</span>
        <div className="glossary-pro__title">{glossaryData[current].term}</div>
        <p className="glossary-pro__description">{glossaryData[current].description}</p>
      </div>
      <div className="glossary-pro__controls">
        <button className="glossary-pro__arrow" onClick={prev}>‹</button>
        <div className="glossary-pro__dots">
          {glossaryData.map((_, i) => (
            <button key={i} className={`glossary-pro__dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
        <button className="glossary-pro__arrow" onClick={next}>›</button>
      </div>
    </div>
  );
}

const RasgosContent = ({ traits, groupedData, isMobile }) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (groupName) => {
    setExpandedCards(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  if (!traits || traits.length === 0) {
    return (
      <div className="card-pro card-large-pro p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800">Aún no tenemos rasgos disponibles</h3>
        <p className="text-sm text-gray-600 mt-2">Cuando tus resultados estén listos, verás aquí tus rasgos genéticos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 grid grid-cols-1 gap-8 rasgos-groups-column">
        {groupedData.map(group => {
          const isExpanded = expandedCards[group.name];
          return (
            <div key={group.name} className="card-pro card-large-pro rasgos-card p-6 pb-12 flex flex-col transition-none">
              <div className="card-pro__header mb-2 cursor-pointer flex justify-between items-center" onClick={() => toggleCard(group.name)}>
                <div className="flex items-center">
                  <span className="w-4 h-4 rounded-md mr-3" style={{ backgroundColor: group.fill }}></span>
                  <h3 className="card-pro__title text-base">{group.name}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 ml-7">{groupDescriptions[group.name] || 'Rasgos asociados a esta categoría.'}</p>

              {isExpanded && (
                <div className="trait-list">
                  {group.traits.map((trait, index) => (
                    <TraitBar
                      key={index}
                      trait={trait}
                      name={trait.name || trait.fenotipo}
                      level={trait.level || 'medium'}
                      percentage={typeof trait.percentage === 'number' ? trait.percentage : 50}
                      groupColor={group.fill}
                    />
                  ))}
                </div>
              )}

            </div>
          )
        })}
      </div>
      <div className="space-y-8">
        {!isMobile && (
          <div className="card-pro card-small-pro p-4">
            <div className="flex items-center gap-2">
                <h2 className="card-pro__title text-base rasgos-summary-title">Resumen de Rasgos</h2>
                <Tooltip content="Este gráfico muestra el promedio de predisposición para cada categoría de rasgos, dándote una vista general de tus tendencias genéticas.">
                    <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltip>
            </div>
            <GroupedActivityGauge groupedData={groupedData} />
          </div>
        )}
        <GlossaryCarousel />
      </div>
    </div>
  );
};

const Rasgos = () => {
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUser();
    fetchTraits();
  }, []);

  const fetchUser = async () => {
    const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
    if (response.data) {
      setUser(response.data.user || response.data);
    }
  };

  const fetchTraits = async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest(API_ENDPOINTS.TRAITS, { method: 'GET' });
    if (!response.ok) {
      setError('No pudimos cargar tus rasgos genéticos. Intenta nuevamente.');
      setLoading(false);
      return;
    }
    const traitsData = response.data?.data?.traits || [];
    setTraits(traitsData);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (_) {}
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

  const groupedData = useMemo(() => {
    if (!traits || traits.length === 0) return [];
    const groups = {};
    const groupColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'];
    let colorIndex = 0;

    traits.forEach(trait => {
      const groupName = trait.group || 'Rasgos';
      if (!groups[groupName]) {
        groups[groupName] = {
          traits: [],
          totalPercentage: 0,
          color: groupColors[colorIndex % groupColors.length]
        };
        colorIndex++;
      }
      const value = typeof trait.percentage === 'number' ? trait.percentage : 50;
      groups[groupName].traits.push(trait);
      groups[groupName].totalPercentage += value;
    });

    const priorityOrder = [
      'Metabolismo',
      'Rendimiento Físico y Sensorial',
      'Cognición',
      'Bienestar y Salud',
      'Apariencia Física',
      'Rasgos',
    ];

    return Object.keys(groups)
      .sort((a, b) => {
        const ia = priorityOrder.indexOf(a);
        const ib = priorityOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map(groupName => {
        const group = groups[groupName];
        const average = Math.round(group.totalPercentage / group.traits.length);
        return {
          name: groupName,
          value: average,
          fill: group.color,
          traits: group.traits,
        };
      });
  }, [traits]);

  return (
    <div className="rasgos-layout">
      {window.innerWidth <= 1024 && (
        <button className="rasgos-layout__burger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}
      <aside className="rasgos-layout__sidebar">
        <Sidebar items={sidebarItems} onLogout={handleLogout} user={user} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      </aside>
      <main className="rasgos-layout__main">
        <div className="rasgos-page">
          <SectionHeader title="Rasgos Genéticos" subtitle="Están divididos en cinco categorías para desglosar tus rasgos. Además tu predisposición genética indica si tienes probabilidades bajas, altas o medias de tener estos." icon={Activity} />
          {!loading && !error && isMobile && (
            <div className="card-pro card-small-pro p-4 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="card-pro__title text-base rasgos-summary-title">Resumen de Rasgos</h2>
                <Tooltip content="Este gráfico muestra el promedio de predisposición para cada categoría de rasgos, dándote una vista general de tus tendencias genéticas.">
                    <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltip>
            </div>
              <GroupedActivityGauge groupedData={groupedData} />
            </div>
          )}
          {loading ? (
            <div className="rasgos-page__loading">
              <div className="spinner" />
              <p>Analizando tus rasgos genéticos...</p>
            </div>
          ) : error ? (
            <div className="rasgos-page__error">
              <p>{error}</p>
              <button onClick={fetchTraits}>Reintentar</button>
            </div>
          ) : (
            <RasgosContent traits={traits} groupedData={groupedData} isMobile={isMobile} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Rasgos;