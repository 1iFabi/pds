import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, TestTube, AlertCircle, TrendingUp, BarChart3, Dna
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import PriorityCard from '../../components/PriorityCard/PriorityCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import './Enfermedades.css';

/* ===========================
   Donut Chart (ECharts)
=========================== */
function DonutChart({ data }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { show: false },
    series: [
      {
        name: 'Enfermedades',
        type: 'pie',
        radius: ['70%', '85%'],
        padAngle: 3,
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: false },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' }
        },
        labelLine: { show: false },
        data: data.map(d => ({
          value: d.value,
          name: d.label,
          itemStyle: { color: d.color }
        }))
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '32%',
        style: { text: total.toString(), fontSize: 40, fontWeight: 'bold', fill: '#111827' }
      },
      {
        type: 'text',
        left: 'center',
        top: '56%',
        style: { text: 'Enfermedades', fontSize: 14, fill: '#6B7280' }
      }
    ]
  };

  return (
    <div className="card-pro card-large-pro">
      <div className="card-pro__header">
        <div>
          <h3>Tus enfermedades</h3>
          <p className="card-pro__subtitle">Distribución por nivel de prioridad clínica</p>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: '280px', marginTop: '5px' }} opts={{ renderer: 'svg' }} />

      <div className="legend-pro">
        {data.map((item, i) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <div className="legend-pro__item" key={i}>
              <div className="legend-pro__left">
                <span className="legend-pro__dot" style={{ background: item.color }} />
                <span className="legend-pro__label">{item.label}</span>
              </div>
              <span className="legend-pro__value">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===========================
   KPI Card con tooltip
=========================== */
function KPICard({ title, value, subtitle, iconComponent, iconColor, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (triggerRef.current && tooltipRef.current) {
      setTimeout(() => {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current.offsetHeight;
        tooltipRef.current.style.position = 'fixed';
        tooltipRef.current.style.top = (rect.top + rect.height / 2 - tooltipHeight / 2) + 'px';
        tooltipRef.current.style.left = (rect.right + 16) + 'px';
        tooltipRef.current.style.zIndex = '9999';
      }, 0);
    }
  };

  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <div className="card-pro card-small-pro kpi-card-modern">
      <div className="kpi-pro">
        <div className="kpi-pro__content">
          <div className="kpi-header-tooltip">
            <h3>{title}</h3>
            {tooltip && (
              <div className="kpi-tooltip-wrapper">
                <button
                  ref={triggerRef}
                  className="kpi-tooltip-trigger"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={e => e.preventDefault()}
                >
                  ?
                </button>
                {showTooltip && (
                  <div ref={tooltipRef} className="kpi-tooltip" style={{ position: 'fixed', display: 'block' }}>
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="kpi-pro__value">{value}</div>
          <p className="kpi-pro__subtitle">{subtitle}</p>
        </div>
        <div className="kpi-pro__icon" style={{ background: iconColor }}>
          {iconComponent}
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Score Genético Moderno
=========================== */
function ScoreGenericCard({ score }) {
  const getScoreData = () => {
    if (score < 20) return {
      color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      level: 'Excelente', icon: '✓', bgColor: 'rgba(16,185,129,0.1)',
      description: 'Tu perfil genético muestra un riesgo muy bajo'
    };
    if (score < 40) return {
      color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      level: 'Bueno', icon: '✓', bgColor: 'rgba(59,130,246,0.1)',
      description: 'Tu perfil genético está dentro de parámetros favorables'
    };
    if (score < 60) return {
      color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      level: 'Moderado', icon: '!', bgColor: 'rgba(245,158,11,0.1)',
      description: 'Se recomienda monitoreo preventivo personalizado'
    };
    if (score < 80) return {
      color: '#F97316', gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      level: 'Elevado', icon: '⚠', bgColor: 'rgba(249,115,22,0.1)',
      description: 'Considera evaluación médica para plan preventivo'
    };
    return {
      color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      level: 'Alto', icon: '⚠', bgColor: 'rgba(239,68,68,0.1)',
      description: 'Se sugiere consulta médica para seguimiento'
    };
  };

  const { color, gradient, level, icon, bgColor, description } = getScoreData();
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className="score-card-modern"
      style={{
        background: 'white', borderRadius: '20px', padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #F3F4F6',
        display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute', top: '-50%', right: '-20%', width: '150%', height: '150%',
          background: `radial-gradient(circle, ${bgColor} 0%, transparent 70%)`, pointerEvents: 'none', opacity: 0.6
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.8px' }}>
          SCORE GENÉTICO
        </h3>
        <div
          style={{
            width: 40, height: 40, borderRadius: 12, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color}40`
          }}
        >
          <TrendingUp size={20} color="white" strokeWidth={2.5} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="50" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle
              cx="70" cy="70" r="50" fill="none" stroke={color} strokeWidth="12"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 8px ${color}60)` }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color }}>{score}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#9CA3AF' }}>%</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '12px 16px', background: bgColor, borderRadius: 12, border: `2px solid ${color}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color }}>{icon}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color }}>{level}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color, fontWeight: 600, lineHeight: 1.4 }}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Info Importante (glassy)
=========================== */
function QuickKPICard() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="info-card-modern"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
        borderRadius: 20, padding: 18, boxShadow: '0 4px 20px rgba(102,126,234,0.25)',
        border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', gap: 16,
        transition: 'all 0.3s ease', transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        position: 'absolute', top: '-50%', right: '-30%', width: '100%', height: '150%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', pointerEvents: 'none'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
        }}>
          <AlertCircle size={22} color="white" strokeWidth={2.5} />
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
          Información Importante
        </h3>
      </div>
      <div style={{
        position: 'relative', zIndex: 1, padding: '14px 16px', background: 'rgba(255,255,255,0.15)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)'
      }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
          Este perfil genético es <strong style={{ fontWeight: 700, color: 'white' }}>informativo</strong> y no
          constituye diagnóstico clínico. Consulta siempre con un especialista.
        </p>
      </div>
    </div>
  );
}

/* ===========================
   Glosario Carousel
=========================== */
const glossaryData = [
  { term: 'RSID', description: 'Código único (ej: rs1234567) que identifica una variante específica en bases de datos científicas.' },
  { term: 'Magnitud', description: 'Escala (0–5) que mide la importancia clínica de una variante. Mayor valor = mayor impacto.' },
  { term: 'Alelo', description: 'Cada variante posible de un gen. Heredas una de cada progenitor.' },
  { term: 'Fenotipo', description: 'Características observables (p.ej., color de ojos). Surge de genes + ambiente.' },
  { term: 'Genotipo', description: 'Tu composición genética heredada de ambos progenitores.' },
  { term: 'Gen', description: 'Segmento de ADN con instrucciones para una proteína.' },
];

function GlossaryCarousel() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent(c => (c - 1 + glossaryData.length) % glossaryData.length);
  const next = () => setCurrent(c => (c + 1) % glossaryData.length);

  return (
    <div className="card-pro card-small-pro glossary-pro">
      <div className="glossary-pro__content">
        <span className="glossary-pro__badge">GLOSARIO</span>
        <div className="glossary-pro__title">{glossaryData[current].term}</div>
        <p className="glossary-pro__description">{glossaryData[current].description}</p>
      </div>
      <div className="glossary-pro__controls">
        <button className="glossary-pro__arrow" onClick={prev} aria-label="Anterior">←</button>
        <div className="glossary-pro__dots">
          {glossaryData.map((_, i) => (
            <button
              key={i}
              className={`glossary-pro__dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Término ${i + 1}`}
            />
          ))}
        </div>
        <button className="glossary-pro__arrow" onClick={next} aria-label="Siguiente">→</button>
      </div>
    </div>
  );
}

/* ===========================
   Página Enfermedades (con Sidebar)
=========================== */
const Enfermedades = () => {
  const [snps, setSnps] = useState({ alta: [], media: [], baja: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchDiseases();
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

  const fetchUser = async () => {
    const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
    if (response.ok && response.data) setUser(response.data.user || response.data);
  };

  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest(API_ENDPOINTS.DISEASES, { method: 'GET' });

      if (!response.ok) {
        setError('No se pudieron cargar las enfermedades');
        setLoading(false);
        return;
      }

      let snpsData = response.data?.data || response.data?.snps || response.data;

      if (snpsData) {
        if (Array.isArray(snpsData)) {
          const processed = { alta: [], media: [], baja: [] };
          snpsData.forEach(item => {
            const priority = item.prioridad || item.priority || item.nivel || 'baja';
            if (priority === 'alta' || priority === 'high' || priority === 1) processed.alta.push(item);
            else if (priority === 'media' || priority === 'medium' || priority === 2) processed.media.push(item);
            else processed.baja.push(item);
          });
          setSnps(processed);
        } else if (typeof snpsData === 'object') {
          setSnps({
            alta: snpsData.alta || [],
            media: snpsData.media || [],
            baja: snpsData.baja || []
          });
        }
      }
    } catch (e) {
      setError('Ocurrió un error al cargar las enfermedades');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' }); } catch (_) {}
    clearToken(); navigate('/');
  };

  const sidebarItems = useMemo(() => [
    { label: 'Ancestría', href: '/dashboard/ancestria' },
    { label: 'Rasgos', href: '/dashboard/rasgos' },
    { label: 'Farmacogenética', href: '/dashboard/farmacogenetica' },
    { label: 'Biomarcadores', href: '/dashboard/biomarcadores' },
    { label: 'Biométricas', href: '/dashboard/biometricas' },
    { label: 'Enfermedades', href: '/dashboard/enfermedades' },
  ], []);

  const donutData = useMemo(() => ([
    { label: 'Alta prioridad', value: snps.alta.length, color: '#8b5cf6' },
    { label: 'Media prioridad', value: snps.media.length, color: '#06b6d4' },
    { label: 'Baja prioridad', value: snps.baja.length, color: '#f59e0b' }
  ]), [snps]);

  const avgMagnitude = useMemo(() => {
    const allSnps = [...snps.alta, ...snps.media, ...snps.baja];
    let total = 0; let count = 0;
    allSnps.forEach(s => {
      const mag = parseFloat(s.magnitud_efecto) || parseFloat(s.magnitude) || parseFloat(s.effect_size) || 0;
      if (!Number.isNaN(mag) && mag > 0) { total += mag; count++; }
    });
    return count > 0 ? (total / count).toFixed(1) : '0';
  }, [snps]);

  const pathogenicGenes = useMemo(() => {
    const allSnps = [...snps.alta, ...snps.media, ...snps.baja];
    return allSnps.filter(s => {
      const mag = parseFloat(s.magnitud_efecto) || parseFloat(s.magnitude) || parseFloat(s.effect_size);
      if (mag >= 3.0) return true;
      const priority = s.prioridad || s.priority;
      if (priority === 'alta' || priority === 'high' || priority === 1) return true;
      return false;
    }).length;
  }, [snps]);

  const geneticScore = useMemo(() => {
    const avg = parseFloat(avgMagnitude);
    return Math.round((isNaN(avg) ? 0 : avg) / 5 * 100);
  }, [avgMagnitude]);

  const getPrioritiesData = () => {
    const mapPriority = (priority) => {
      const priorityMap = { alta: 'high', media: 'medium', baja: 'low' };
      const titleMap = { alta: 'Prioridad Alta', media: 'Prioridad Media', baja: 'Prioridad Baja' };
      return { level: priorityMap[priority], title: titleMap[priority] };
    };

    return ['alta', 'media', 'baja'].map(priority => {
      const { level, title } = mapPriority(priority);
      const diseases = (snps[priority] || []).map((snp, idx) => ({
        id: `${snp.rsid || snp.rs_id || snp.id || 'rs'}-${idx}`,
        title: snp.fenotipo || snp.phenotype || snp.disease || snp.enfermedad,
        rsId: snp.rsid || snp.rs_id || snp.rsID,
        genotype: snp.genotipo || snp.genotype || snp.gt,
        description: snp.fenotipo || snp.phenotype || snp.description || snp.disease
      }));
      return { level, title, diseases };
    });
  };

  const MainGrid = () => (
    <div className="enfermedades-page__content">
      <div className="dashboard-pro-3col">
        <DonutChart data={donutData} />
        <div className="kpis-stack">
          <KPICard
            title="Magnitud promedio"
            value={`${avgMagnitude} / 5`}
            subtitle="Severidad clínica promedio"
            iconComponent={<BarChart3 size={28} color="white" strokeWidth={2} />}
            iconColor="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
            tooltip="Promedio de la magnitud de efecto de todas tus variantes genéticas. Escala de 0 a 5 donde 5 es máximo riesgo."
          />
          <KPICard
            title="Genes patógenos"
            value={pathogenicGenes}
            subtitle="Variantes de alto riesgo"
            iconComponent={<Dna size={28} color="white" strokeWidth={2} />}
            iconColor="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            tooltip="Número de variantes con magnitud ≥ 3.0 o marcadas como alta prioridad."
          />
          <QuickKPICard />
        </div>
        <div className="score-recommendations-stack">
          <GlossaryCarousel />
          <ScoreGenericCard score={geneticScore} />
        </div>
      </div>

      <div className="enfermedades-page__priorities-container">
        {getPrioritiesData().map((priority) => (
          <PriorityCard key={priority.level} level={priority.level} title={priority.title} diseases={priority.diseases} />
        ))}
      </div>

      {snps.alta.length === 0 && snps.media.length === 0 && snps.baja.length === 0 && (
        <div className="enfermedades-page__empty">
          <p>No se encontraron predisposiciones genéticas a enfermedades en tu perfil.</p>
        </div>
      )}
    </div>
  );

  if (loading || error) {
    return (
      <div className="enfermedades-layout">
        {isMobile && (
          <button
            className="enfermedades-layout__burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </button>
        )}

        <aside className="enfermedades-layout__sidebar">
          <Sidebar
            items={sidebarItems}
            onLogout={handleLogout}
            user={user}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </aside>

        <main className="enfermedades-layout__main">
          <div className="enfermedades-page">
            <SectionHeader
              title="Enfermedades"
              subtitle="Aquí podrás explorar tu predisposición genética a distintas enfermedades. Descubre qué mutaciones y variantes están presentes en tu ADN y cómo pueden influir en tu salud."
              icon={TestTube}
            />
            {loading ? (
              <div className="enfermedades-page__loading">
                <div className="spinner" />
                <p>Cargando información genética...</p>
              </div>
            ) : (
              <div className="enfermedades-page__error">
                <p>{error}</p>
                <button onClick={fetchDiseases}>Reintentar</button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="enfermedades-layout">
      {isMobile && (
        <button
          className="enfermedades-layout__burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
        </button>
      )}

      <aside className="enfermedades-layout__sidebar">
        <Sidebar
          items={sidebarItems}
          onLogout={handleLogout}
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="enfermedades-layout__main">
        <div className="enfermedades-page">
          <SectionHeader
            title="Enfermedades"
            subtitle="Aquí podrás explorar tu predisposición genética a distintas enfermedades. Descubre qué mutaciones y variantes están presentes en tu ADN y cómo pueden influir en tu salud."
            icon={TestTube}
          />
          <MainGrid />
        </div>
      </main>
    </div>
  );
};

export default Enfermedades;