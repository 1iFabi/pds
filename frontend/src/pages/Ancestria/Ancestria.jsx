import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Dna } from 'lucide-react';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import IndigenousRadarChart from '../../components/IndigenousRadarChart/IndigenousRadarChart';
import compassRose from '../../assets/compass-rose.svg';
import './Ancestria.css';

const drawChart = (element, data, options, onCountryClick) => {
  // Acceder a google desde window
  const { google } = window;
  if (!google || !google.visualization || !google.visualization.GeoChart) {
    return;
  }
  
  // Mapeo de países a nombres descriptivos
  const countryNames = {
    'CL': 'Chile',
    'ES': 'España',
    'CN': 'China',
    'AR': 'Argentina',
    'IT': 'Italia',
    'DE': 'Alemania',
    'FR': 'Francia',
    'PE': 'Perú',
    'MX': 'México',
    'FI': 'Finlandia',
    'NG': 'Nigeria',
    'US': 'Estados Unidos',
    'BR': 'Brasil',
    'GB': 'Reino Unido',
    'JP': 'Japón',
    'IN': 'India',
    'RU': 'Rusia',
    'CA': 'Canadá',
    'AU': 'Australia',
    'KR': 'Corea del Sur',
    'ZA': 'Sudáfrica',
    'EG': 'Egipto',
    'SE': 'Suecia',
    'NO': 'Noruega',
    'DK': 'Dinamarca',
    'PL': 'Polonia',
    'PT': 'Portugal',
    'GR': 'Grecia',
    'TR': 'Turquía',
    'NL': 'Países Bajos',
    'BE': 'Bélgica',
    'CH': 'Suiza',
    'AT': 'Austria',
    'IE': 'Irlanda',
    'NZ': 'Nueva Zelanda',
    'TH': 'Tailandia',
    'VN': 'Vietnam',
    'PH': 'Filipinas',
    'ID': 'Indonesia',
    'MY': 'Malasia',
    'SG': 'Singapur',
    'HK': 'Hong Kong',
    'TW': 'Taiwán',
    'IL': 'Israel',
    'SA': 'Arabia Saudita',
    'AE': 'Emiratos Árabes Unidos',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'CR': 'Costa Rica',
    'PA': 'Panamá',
    'CU': 'Cuba',
    'DO': 'República Dominicana',
    'PR': 'Puerto Rico',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'SV': 'El Salvador',
    'NI': 'Nicaragua',
    'CZ': 'República Checa',
    'HU': 'Hungría',
    'RO': 'Rumanía',
    'BG': 'Bulgaria',
    'HR': 'Croacia',
    'SI': 'Eslovenia',
    'SK': 'Eslovaquia',
    'UA': 'Ucrania',
    'BY': 'Bielorrusia',
    'KZ': 'Kazajistán',
    'MA': 'Marruecos',
    'DZ': 'Argelia',
    'TN': 'Túnez',
    'LY': 'Libia',
    'ET': 'Etiopía',
    'KE': 'Kenia',
    'GH': 'Ghana',
    'SN': 'Senegal',
    'CI': 'Costa de Marfil',
    'CM': 'Camerún',
    'AO': 'Angola',
    'MZ': 'Mozambique',
    'ZW': 'Zimbabue',
    'UG': 'Uganda',
    'TZ': 'Tanzania'
  };
  
  // Crear tabla de datos
  const dataArray = data.map((row, index) => {
    if (index === 0) return row; // Header
    return row;
  });
  
  const dataTable = google.visualization.arrayToDataTable(dataArray);
  
  // Configurar opciones sin tooltip
  const finalOptions = {
    ...options,
    tooltip: {
      trigger: 'none'
    }
  };
  
  const chart = new google.visualization.GeoChart(element);
  
  // Event listener para personalizar el tooltip
  google.visualization.events.addListener(chart, 'onmouseover', (e) => {
    const countryCode = e.row !== undefined ? dataTable.getValue(e.row, 0) : null;
    if (countryCode && countryNames[countryCode]) {
      console.log(`${countryNames[countryCode]}: ${dataTable.getValue(e.row, 1)}%`);
    }
  });
  
  // Event listener para click
  google.visualization.events.addListener(chart, 'select', () => {
    const selection = chart.getSelection();
    if (selection.length > 0) {
      const countryCode = dataTable.getValue(selection[0].row, 0);
      if (countryCode && onCountryClick) {
        onCountryClick(countryCode);
      }
    }
  });
  
  chart.draw(dataTable, finalOptions);
  
  // Añadir bordes negros después del renderizado
  google.visualization.events.addListener(chart, 'ready', () => {
    const svgPaths = element.querySelectorAll('svg path');
    svgPaths.forEach(path => {
      if (path.getAttribute('fill') && path.getAttribute('fill') !== 'none') {
        path.setAttribute('stroke', '#000000');
        path.setAttribute('stroke-width', '0.2');
      }
    });
  });
};

const Ancestria = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedAncestry, setSelectedAncestry] = useState(null);
  const [drillDownItem, setDrillDownItem] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [ancestryData, setAncestryData] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    fetchUser();
  }, []); // Fetch user on mount

  useEffect(() => {
    if (user) { // Only fetch ancestry data when the user object is available
      fetchAncestryData();
    }
  }, [user]); // Re-run this effect when the user object changes

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

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event) => {
      const chartElement = document.querySelector('.ancestria-page__chart-card');
      const legendElement = document.querySelector('.ancestria-page__legend-card');
      
      if (selectedAncestry && 
          chartElement && !chartElement.contains(event.target) &&
          legendElement && !legendElement.contains(event.target)) {
        setSelectedAncestry(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedAncestry]);

  const fetchUser = async () => {
    const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
    if (response.ok && response.data) {
      setUser(response.data.user || response.data);
    }
  };

  const fetchAncestryData = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.ANCESTRY, { method: 'GET' });
      if (response.ok && response.data && response.data.data) {
        setAncestryData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ancestry data:', error);
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

  const chartRef = useRef(null);

  // Función auxiliar para mapear nombres de países a códigos ISO
  const getCountryCode = useCallback((countryName) => {
    const countryCodeMap = {
      'Chile': 'CL',
      'España': 'ES',
      'Spain': 'ES',
      'China': 'CN',
      'Argentina': 'AR',
      'Italia': 'IT',
      'Italy': 'IT',
      'Alemania': 'DE',
      'Germany': 'DE',
      'Francia': 'FR',
      'France': 'FR',
      'Perú': 'PE',
      'Peru': 'PE',
      'México': 'MX',
      'Mexico': 'MX',
      'Finlandia': 'FI',
      'Finland': 'FI',
      'Nigeria': 'NG',
      'Estados Unidos': 'US',
      'United States': 'US',
      'Brasil': 'BR',
      'Brazil': 'BR',
      'Reino Unido': 'GB',
      'United Kingdom': 'GB',
      'Japón': 'JP',
      'Japan': 'JP',
      'India': 'IN',
      'Rusia': 'RU',
      'Russia': 'RU',
      'Canadá': 'CA',
      'Canada': 'CA',
      'Australia': 'AU',
      'Corea del Sur': 'KR',
      'South Korea': 'KR',
      'Sudáfrica': 'ZA',
      'South Africa': 'ZA',
      'Egipto': 'EG',
      'Egypt': 'EG',
      'Suecia': 'SE',
      'Sweden': 'SE',
      'Noruega': 'NO',
      'Norway': 'NO',
      'Dinamarca': 'DK',
      'Denmark': 'DK',
      'Polonia': 'PL',
      'Poland': 'PL',
      'Portugal': 'PT',
      'Grecia': 'GR',
      'Greece': 'GR',
      'Turquía': 'TR',
      'Turkey': 'TR',
      'Países Bajos': 'NL',
      'Netherlands': 'NL',
      'Bélgica': 'BE',
      'Belgium': 'BE',
      'Suiza': 'CH',
      'Switzerland': 'CH',
      'Austria': 'AT',
      'Irlanda': 'IE',
      'Ireland': 'IE',
      'Nueva Zelanda': 'NZ',
      'New Zealand': 'NZ',
      'Tailandia': 'TH',
      'Thailand': 'TH',
      'Vietnam': 'VN',
      'Filipinas': 'PH',
      'Philippines': 'PH',
      'Indonesia': 'ID',
      'Malasia': 'MY',
      'Malaysia': 'MY',
      'Singapur': 'SG',
      'Singapore': 'SG',
      'Hong Kong': 'HK',
      'Taiwán': 'TW',
      'Taiwan': 'TW',
      'Israel': 'IL',
      'Arabia Saudita': 'SA',
      'Saudi Arabia': 'SA',
      'Emiratos Árabes Unidos': 'AE',
      'UAE': 'AE',
      'Colombia': 'CO',
      'Venezuela': 'VE',
      'Ecuador': 'EC',
      'Bolivia': 'BO',
      'Paraguay': 'PY',
      'Uruguay': 'UY',
      'Costa Rica': 'CR',
      'Panamá': 'PA',
      'Panama': 'PA',
      'Cuba': 'CU',
      'República Dominicana': 'DO',
      'Dominican Republic': 'DO',
      'Puerto Rico': 'PR',
      'Guatemala': 'GT',
      'Honduras': 'HN',
      'El Salvador': 'SV',
      'Nicaragua': 'NI',
      'República Checa': 'CZ',
      'Czech Republic': 'CZ',
      'Hungría': 'HU',
      'Hungary': 'HU',
      'Rumanía': 'RO',
      'Romania': 'RO',
      'Bulgaria': 'BG',
      'Croacia': 'HR',
      'Croatia': 'HR',
      'Eslovenia': 'SI',
      'Slovenia': 'SI',
      'Eslovaquia': 'SK',
      'Slovakia': 'SK',
      'Ucrania': 'UA',
      'Ukraine': 'UA',
      'Bielorrusia': 'BY',
      'Belarus': 'BY',
      'Kazajistán': 'KZ',
      'Kazakhstan': 'KZ',
      'Marruecos': 'MA',
      'Morocco': 'MA',
      'Argelia': 'DZ',
      'Algeria': 'DZ',
      'Túnez': 'TN',
      'Tunisia': 'TN',
      'Libia': 'LY',
      'Libya': 'LY',
      'Etiopía': 'ET',
      'Ethiopia': 'ET',
      'Kenia': 'KE',
      'Kenya': 'KE',
      'Ghana': 'GH',
      'Senegal': 'SN',
      'Costa de Marfil': 'CI',
      'Ivory Coast': 'CI',
      'Camerún': 'CM',
      'Cameroon': 'CM',
      'Angola': 'AO',
      'Mozambique': 'MZ',
      'Zimbabue': 'ZW',
      'Zimbabwe': 'ZW',
      'Uganda': 'UG',
      'Tanzania': 'TZ'
    };
    return countryCodeMap[countryName] || countryCodeMap[countryName?.split(' ')[0]] || null;
  }, []);

  // Datos para el GeoChart - códigos ISO-2 válidos
  const getChartData = useCallback(() => {
    if (!ancestryData || !ancestryData.countries || ancestryData.countries.length === 0) {
      // Return empty data if no ancestry data
      return [['País', 'Porcentaje']];
    }

    const chartData = [['País', 'Porcentaje']];
    ancestryData.countries.forEach(country => {
      const code = getCountryCode(country.name);
      if (code) {
        chartData.push([code, Math.round(country.percentage)]);
      }
    });

    return chartData;
  }, [ancestryData, getCountryCode]);

  const handleBackFromDrillDown = () => {
    setDrillDownItem(null);
    setSelectedAncestry(null);
  };

  // Opciones para GeoChart - usa gradiente azul siguiendo la paleta del proyecto
  const chartOptions = useMemo(() => ({
    title: '',
    colorAxis: { 
      colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1']
    },
    backgroundColor: '#ffffff',
    datalessRegionColor: '#fafafcff',
    defaultColor: '#f5f5f5',
    region: 'world',
    displayMode: 'regions',
    height: isMobile ? 300 : 500,
    width: '100%',
    legend: 'none',
    enableRegionInteractivity: true,
    tooltip: { trigger: 'none' },
    focusTarget: 'none'
  }), [isMobile]);

  // Cargar Google Charts y dibujar el gráfico
  useEffect(() => {
    const loadAndDrawChart = () => {
      // Agregar delay para asegurar que el DOM está listo
      setTimeout(() => {
        if (!chartRef.current) {
          console.warn('chartRef.current no existe');
          return;
        }
        
        const { google } = window;
        
        const handleCountryClick = (countryCode) => {
          setSelectedCountry(countryCode);
        };
        
        if (!google || !google.visualization) {
          // Cargar la librería desde CDN
          const script = document.createElement('script');
          script.src = 'https://www.gstatic.com/charts/loader.js';
          script.onload = () => {
            const { google } = window;
            google.charts.load('current', { packages: ['geochart'] });
            google.charts.setOnLoadCallback(() => {
              if (chartRef.current) {
                drawChart(chartRef.current, getChartData(), chartOptions, handleCountryClick);
              }
            });
          };
          document.head.appendChild(script);
        } else {
          // Si google ya está cargado, verificar si GeoChart está disponible
          if (google.visualization && google.visualization.GeoChart) {
            drawChart(chartRef.current, getChartData(), chartOptions, handleCountryClick);
          } else {
            // Si no está cargado, cargar el paquete
            google.charts.load('current', { packages: ['geochart'] });
            google.charts.setOnLoadCallback(() => {
              if (chartRef.current) {
                drawChart(chartRef.current, getChartData(), chartOptions, handleCountryClick);
              }
            });
          }
        }
      }, 100);
    };
    
    loadAndDrawChart();
  }, [selectedAncestry, drillDownItem, chartOptions, getChartData]);

  // Generar información dinámica del país basada en datos reales
  const getCountryInfo = useCallback((countryCode) => {
    if (!ancestryData || !ancestryData.countries) return null;
    
    // Encontrar el país en los datos del usuario
    const countryData = ancestryData.countries.find(c => getCountryCode(c.name) === countryCode);
    if (!countryData) return null;
    
    const percentage = countryData.percentage?.toFixed(1) || 0;
    const continent = countryData.continent || 'Desconocido';
    
    // Generar descripción dinámica basada en el porcentaje
    let description = '';
    if (percentage >= 30) {
      description = `Tu ascendencia de ${countryData.name} es predominante en tu perfil genético, representando una parte significativa de tu herencia.`;
    } else if (percentage >= 15) {
      description = `Tu herencia de ${countryData.name} representa una porción considerable de tu composición genética.`;
    } else if (percentage >= 5) {
      description = `Tu ascendencia de ${countryData.name} aporta diversidad importante a tu perfil genético.`;
    } else {
      description = `Tu conexión genética con ${countryData.name} refleja la rica diversidad de tus raíces ancestrales.`;
    }
    
    // Detalles genéricos pero informativos
    // Normalizar el continente para corregir problemas de encoding
    const normalizedContinent = continent?.replace(/Àfrica/g, 'África')?.replace(/àfrica/g, 'áfrica') || continent;
    const details = [
      `Continente de origen: ${normalizedContinent}`,
      `Basado en ${countryData.variant_count || 0} variante(s) genética(s) analizada(s)`,
      `Frecuencia alélica promedio: ${(countryData.avg_allele_frequency * 100)?.toFixed(2) || 0}%`,
      `Esta ascendencia contribuye a tu composición genética única`
    ];
    
    return {
      name: countryData.name,
      percentage: percentage,
      description: description,
      details: details,
      continent: normalizedContinent,
      variantCount: countryData.variant_count || 0
    };
  }, [ancestryData, getCountryCode]);

  // Renderizar modal
  const Modal = ({ country, onClose }) => {
    if (!country) return null;
    const info = getCountryInfo(country);
    if (!info) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }} onClick={onClose}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#0b7ad0', fontSize: '1.8rem' }}>{info.name}</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.8rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '1rem' }}>
              {info.description}
            </p>
            <div style={{
              backgroundColor: '#f0f7ff',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              borderLeft: '4px solid #0b7ad0'
            }}>
              <p style={{ margin: 0, fontSize: '1rem', color: '#0b7ad0', fontWeight: 'bold' }}>
                Porcentaje de ascendencia: {info.percentage}%
              </p>
            </div>
          </div>
          
          {/* Información adicional sobre el continente */}
          <div style={{
            backgroundColor: '#f8f9ff',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                Continente:
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0b7ad0' }}>
                {info.continent || 'Desconocido'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                Variantes analizadas:
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0b7ad0' }}>
                {info.variantCount}
              </span>
            </div>
          </div>
          
          <h3 style={{ color: '#0b7ad0', marginBottom: '1rem' }}>Información Genética:</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {info.details.map((detail, idx) => (
              <li key={idx} style={{ marginBottom: '0.75rem', color: '#555', lineHeight: '1.5' }}>
                {detail}
              </li>
            ))}
          </ul>
          
          <button
            onClick={onClose}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              backgroundColor: '#0b7ad0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              width: '100%',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0a5fa8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0b7ad0'}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="ancestria-dashboard">
      <Modal country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      {/* Burger button para móviles */}
      {isMobile && (
        <button 
          className="ancestria-dashboard__burger"
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

      <aside className="ancestria-dashboard__sidebar">
        <Sidebar 
          items={sidebarItems} 
          onLogout={handleLogout} 
          user={user}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </aside>

      <main className="ancestria-dashboard__main">
        <div className="ancestria-page">
          <SectionHeader
            title="Ancestría"
            subtitle="Conoce la composición de tus raíces genéticas, expresadas en porcentajes según su predominancia."
            icon={Dna}
          />

          <div className="ancestria-page__content">
            <div className="ancestria-page__chart-card" style={{ gridColumn: '1 / -1', position: 'relative' }}>
              {drillDownItem && (
                <div className="ancestria-page__drill-header">
                  <button 
                    className="ancestria-page__back-button"
                    onClick={handleBackFromDrillDown}
                  >
                    ← Volver a vista general
                  </button>
                  <h3 className="ancestria-page__drill-title">
                    Desglose de {drillDownItem}
                  </h3>
                </div>
              )}
              
              <div style={{ position: 'relative', width: '100%' }}>
                {/* Logo a la derecha del geochart */}
                <img
                  src="/cNormal.png"
                  alt="GenomIA Logo"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 15,
                    height: isMobile ? '30px' : '50px',
                    objectFit: 'contain',
                    filter: 'grayscale(100%)'
                  }}
                />
                
                {/* Rosa de los vientos SVG */}
                <img
                  src={compassRose}
                  alt="Brújula"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    width: isMobile ? '40px' : '70px',
                    height: isMobile ? '40px' : '70px',
                    zIndex: 10,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}
                />
                
                <div
                  ref={chartRef}
                  className="ancestria-geochart-container"
                  style={{
                    width: '100%',
                    height: isMobile ? '450px' : '600px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    position: 'relative'
                  }}
                />
                
                {/* Leyenda dentro del GeoChart solo en desktop */}
                {!isMobile && (
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                    zIndex: 10,
                    border: '1px solid rgba(11, 122, 208, 0.2)'
                  }}>
                    <h4 style={{
                      margin: '0 0 0.6rem 0',
                      color: '#0b7ad0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Ascendencia
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.4rem'
                    }}>
                    {(ancestryData?.countries || []).slice(0, 8).map((item, idx) => {
                      const colors = ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9'];
                      const code = getCountryCode(item.name) || '';
                      return {
                        code: code,
                        name: item.name,
                        pct: ancestryData ? `${item.percentage?.toFixed(1) || 0}%` : '0%',
                        color: colors[idx]
                      };
                    }).map((item) => (
                      <div
                        key={item.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: '#fafafa'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onClick={() => setSelectedCountry(item.code)}
                      >
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: item.color,
                          borderRadius: '2px',
                          flexShrink: 0
                        }} />
                        <span style={{
                          fontSize: '0.65rem',
                          color: '#333',
                          fontWeight: '500',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          color: '#0b7ad0',
                          minWidth: '28px',
                          textAlign: 'right'
                        }}>
                          {item.pct}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
              
              {/* Leyenda debajo del mapa solo en móvil */}
              {isMobile && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(11, 122, 208, 0.2)'
                }}>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    color: '#0b7ad0',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Ascendencia
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    {(ancestryData?.countries || []).slice(0, 8).map((item, idx) => {
                      const colors = ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9'];
                      const code = getCountryCode(item.name) || '';
                      return {
                        code: code,
                        name: item.name,
                        pct: ancestryData ? `${item.percentage?.toFixed(1) || 0}%` : '0%',
                        color: colors[idx]
                      };
                    }).map((item) => (
                      <div
                        key={item.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.4rem',
                          borderRadius: '4px',
                          backgroundColor: '#fafafa',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedCountry(item.code)}
                      >
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: item.color,
                          borderRadius: '2px',
                          flexShrink: 0
                        }} />
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#333',
                          fontWeight: '500',
                          flex: 1
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#0b7ad0'
                        }}>
                          {item.pct}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Radar Chart de Pueblos Indígenas */}
            <div className="ancestria-page__indigenous-card" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
              <IndigenousRadarChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ancestria;