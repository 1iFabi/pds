import React, { useState } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS, getToken } from '../config/api';

const Buttondownload = ({ userName = 'Usuario', isDownloading: externalIsDownloading, setIsDownloading: externalSetIsDownloading }) => {
  const [internalIsDownloading, setInternalIsDownloading] = useState(false);
  
  const isDownloading = externalIsDownloading !== undefined ? externalIsDownloading : internalIsDownloading;
  const setIsDownloading = externalSetIsDownloading || setInternalIsDownloading;

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const token = getToken();
      const baseUrl = API_ENDPOINTS.BASE_URL.endsWith('/') 
          ? API_ENDPOINTS.BASE_URL.slice(0, -1) 
          : API_ENDPOINTS.BASE_URL;
      
      const response = await fetch(`${baseUrl}/api/auth/report/pdf/`, {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          throw new Error('Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Genetico_${userName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Error descargando el PDF:', err);
      alert('No se pudo descargar el reporte genético en este momento.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <StyledWrapper>
      <button className="button" onClick={handleDownload} disabled={isDownloading}>
        <span className="button-content">
           <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ marginRight: '8px' }}
            aria-hidden="true"
          >
            <path d="M12 15V3"></path>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <path d="m7 10 5 5 5-5"></path>
          </svg>
          {isDownloading ? 'Generando...' : 'Descargar PDF'} 
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    position: relative;
    overflow: hidden;
    height: 3rem;
    padding: 0 2rem;
    border-radius: 1.5rem;
    background: #0b7ad0;
    background-size: 400%;
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.01em;
  }

  .button:hover::before {
    transform: scaleX(1);
  }

  .button-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    transform: scaleX(0);
    transform-origin: 0 50%;
    width: 100%;
    height: inherit;
    border-radius: inherit;
    background: linear-gradient(
      82.3deg,
      rgba(150, 93, 233, 1) 10.8%,
      rgba(99, 88, 238, 1) 94.3%
    );
    transition: all 0.475s;
  }`;

export default Buttondownload;