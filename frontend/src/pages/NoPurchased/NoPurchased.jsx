import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Threads from "../../components/Threadsbg/Threadsbg";
import { clearToken, API_ENDPOINTS, apiRequest } from "../../config/api";
import "./NoPurchased.css";
import logo from "/cNormal.png";

export default function NoPurchased() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
      if (!mounted) return;
      if (response.ok) {
        setUser(response.data.user ?? response.data);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  const handleContact = () => {
    window.location.href = "mailto:proyectogenomia@gmail.com?subject=Consulta sobre el servicio GenomIA";
  };

  return (
    <div className="no-purchased-page">
      <Threads 
        color={[0.8, 0.88, 0.95]}  // Light blue-white for subtle effect
        amplitude={0.4}
        distance={0.08}
        enableMouseInteraction={false}
      />
      
      <div className="no-purchased-overlay" />
      
      <div className="no-purchased-content">
        <div className="no-purchased-card">
          {user && (
            <div className="greeting-badge">Hola, {user.first_name || user.email}</div>
          )}
          <div className="logo-section">
            <img src={logo} alt="GenomIA Logo" className="no-purchased-logo" draggable="false" />
          </div>
          
          <div className="message-section">
            <h1 className="no-purchased-title">
              ¡Bienvenido a<br />
              <span className="brand-name">GenomIA</span>!
            </h1>
            
            <div className="status-badge">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
              </svg>
              <span>Servicio no adquirido</span>
            </div>

            <div className="steps-section">
              <p className="steps-text">
                Ahora que ya estás registrado, puedes realizar tu examen en <strong>Av. Libertador Bernardo O'Higgins 611, Rancagua</strong>. Debes presentarte en el horario de atención estipulado: <strong>08:30 – 16:30 hrs</strong>.
              </p>
            </div>

            <div className="contact-section">
              <p className="contact-text">
                ¿Tienes dudas? Contáctanos:
              </p>
              <button className="contact-button" onClick={handleContact}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                proyectogenomia@gmail.com
              </button>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
