import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import './Rasgos.css';

const Rasgos = () => {
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchTraits();
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

  const fetchTraits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ajusta este endpoint según tu API
      const response = await apiRequest(API_ENDPOINTS.TRAITS || '/api/traits/', { method: 'GET' });
      
      if (!response.ok) {
        setError('No se pudieron cargar los rasgos genéticos');
        setLoading(false);
        return;
      }
      
      if (response.data?.success && response.data?.data) {
        setTraits(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTraits(response.data);
      }
    } catch (err) {
      setError('Error al cargar los rasgos');
      console.error(err);
    }
    
    setLoading(false);
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

  if (loading) {
    return (
      <div className="rasgos-dashboard">
        <aside className="rasgos-dashboard__sidebar">
          <Sidebar 
            items={sidebarItems} 
            onLogout={handleLogout} 
            user={user}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </aside>
        <main className="rasgos-dashboard__main">
          <div className="rasgos-page__loading">
            <div className="spinner"></div>
            <p>Cargando información de rasgos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rasgos-dashboard">
        <aside className="rasgos-dashboard__sidebar">
          <Sidebar 
            items={sidebarItems} 
            onLogout={handleLogout} 
            user={user}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </aside>
        <main className="rasgos-dashboard__main">
          <div className="rasgos-page__error">
            <p>{error}</p>
            <button onClick={fetchTraits}>Reintentar</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="rasgos-dashboard">
      {isMobile && (
        <button 
          className="rasgos-dashboard__burger"
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

      <aside className="rasgos-dashboard__sidebar">
        <Sidebar 
          items={sidebarItems} 
          onLogout={handleLogout} 
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="rasgos-dashboard__main">
        <div className="rasgos-page">
          <SectionHeader
            title="Rasgos Genéticos"
            subtitle="Descubre los rasgos genéticos que influyen en tu apariencia, comportamiento y habilidades únicas."
            icon={Sparkles}
          />

          <div className="rasgos-page__content">
            {traits.length === 0 && !error ? (
              <div className="rasgos-page__empty">
                <p>No se encontraron rasgos genéticos en tu perfil.</p>
              </div>
            ) : (
              <div className="rasgos-page__traits-container">
                {/* Aquí irán los componentes que muestren los rasgos */}
                <p>Rasgos cargados: {traits.length}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rasgos;
