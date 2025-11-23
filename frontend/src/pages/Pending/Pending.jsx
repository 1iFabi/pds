import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Threads from "../../components/Threadsbg/Threadsbg";
import Wait from "../../components/Wait";
import { clearToken, API_ENDPOINTS, apiRequest } from "../../config/api";
import "./Pending.css";

export default function Pending() {
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

  return (
    <div className="pending-page">
      <Threads 
        color={[0.8, 0.88, 0.95]}  // Light blue-white for subtle effect
        amplitude={0.4}
        distance={0.08}
        enableMouseInteraction={false}
      />
      
      <div className="pending-overlay" />
      
      <div className="pending-content">
        <div className="pending-card">
          {user && (
            <div className="greeting-badge">Hola, {user.first_name || user.email}</div>
          )}
          <div className="capybara-section">
            <Wait />
          </div>
          
          <div className="message-section">
            <h1 className="pending-title">
              Estamos procesando tus datos
            </h1>
            
            <div className="status-badge pending">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Análisis en proceso</span>
            </div>

            <p className="pending-message">
              Te notificaremos por correo cuando tus resultados estén listos.
            </p>
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
