import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, TestTube } from 'lucide-react';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import PriorityCard from '../../components/PriorityCard/PriorityCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import './Enfermedades.css';

const Enfermedades = () => {
  const [snps, setSnps] = useState({ alta: [], media: [], baja: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSnp, setExpandedSnp] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    alta: true,
    media: true,
    baja: true
  });
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

  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);
    
    const response = await apiRequest(API_ENDPOINTS.DISEASES, { method: 'GET' });
    
    if (!response.ok) {
      setError('No se pudieron cargar las enfermedades');
      setLoading(false);
      return;
    }
    
    if (response.data?.success && response.data?.data) {
      setSnps(response.data.data);
    }
    
    setLoading(false);
  };

  const toggleSnp = (snpId) => {
    setExpandedSnp(expandedSnp === snpId ? null : snpId);
  };

  const toggleSection = (priority) => {
    setExpandedSections(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
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
    { label: 'Ancestría', href: '#postlogin-ancestria' },
    { label: 'Rasgos', href: '#postlogin-rasgos' },
    { label: 'Farmacogenética', href: '#postlogin-farmacogenetica' },
    { label: 'Biomarcadores', href: '#postlogin-biomarcadores' },
    { label: 'Biométricas', href: '#postlogin-biometricas' },
    { label: 'Enfermedades', href: '/dashboard/enfermedades' },
  ], []);

  // Transform data for PriorityCard component
  const getPrioritiesData = () => {
    const mapPriority = (priority) => {
      const priorityMap = { alta: 'high', media: 'medium', baja: 'low' };
      const titleMap = { alta: 'Prioridad Alta', media: 'Prioridad Media', baja: 'Prioridad Baja' };
      return { level: priorityMap[priority], title: titleMap[priority] };
    };

    return ['alta', 'media', 'baja'].map(priority => {
      const { level, title } = mapPriority(priority);
      const diseases = snps[priority].map((snp, idx) => ({
        id: `${snp.rsid}-${idx}`,
        title: snp.fenotipo,
        rsId: snp.rsid,
        genotype: snp.genotipo,
        description: snp.fenotipo
      }));
      return { level, title, diseases };
    });
  };

  if (loading) {
    return (
      <div className="enfermedades-dashboard">
        <aside className="enfermedades-dashboard__sidebar">
          <Sidebar 
            items={sidebarItems} 
            onLogout={handleLogout} 
            user={user}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </aside>
        <main className="enfermedades-dashboard__main">
          <div className="enfermedades-page__loading">
            <div className="spinner"></div>
            <p>Cargando información genética...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enfermedades-dashboard">
        <aside className="enfermedades-dashboard__sidebar">
          <Sidebar 
            items={sidebarItems} 
            onLogout={handleLogout} 
            user={user}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </aside>
        <main className="enfermedades-dashboard__main">
          <div className="enfermedades-page__error">
            <p>{error}</p>
            <button onClick={fetchDiseases}>Reintentar</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="enfermedades-dashboard">
      {/* Burger button para móviles */}
      {isMobile && (
        <button 
          className="enfermedades-dashboard__burger"
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

      <aside className="enfermedades-dashboard__sidebar">
        <Sidebar 
          items={sidebarItems} 
          onLogout={handleLogout} 
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="enfermedades-dashboard__main">
        <div className="enfermedades-page">
          <SectionHeader
            title="Enfermedades"
            subtitle="Aquí podrás explorar tu predisposición genética a distintas enfermedades. Descubre qué mutaciones y variantes están presentes en tu ADN y cómo pueden influir en tu salud."
            icon={TestTube}
          />

          <div className="enfermedades-page__content">
            <div className="enfermedades-page__priorities-container">
              {getPrioritiesData().map((priority) => (
                <PriorityCard
                  key={priority.level}
                  level={priority.level}
                  title={priority.title}
                  diseases={priority.diseases}
                />
              ))}
            </div>

            {snps.alta.length === 0 && snps.media.length === 0 && snps.baja.length === 0 && (
              <div className="enfermedades-page__empty">
                <p>No se encontraron predisposiciones genéticas a enfermedades en tu perfil.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Enfermedades;
