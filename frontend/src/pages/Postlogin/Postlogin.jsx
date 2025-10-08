import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';

const Postlogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const response = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
      if (!mounted) return;

      if (!response.ok) {
        navigate('/login', { replace: true });
        return;
      }

      setUser(response.data.user ?? response.data);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Error al cerrar sesion', error);
    }
    clearToken();
    navigate('/');
  };

  const handleDownload = () => {
    // TODO: Integrar descarga cuando el endpoint este disponible.
  };

  if (loading) {
    return null;
  }

  return <Dashboard user={user} onLogout={handleLogout} onDownload={handleDownload} />;
};

export default Postlogin;
