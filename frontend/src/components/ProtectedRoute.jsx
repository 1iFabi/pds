import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest, getToken } from '../config/api';

export default function ProtectedRoute({ children, requireService = true }) {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = getToken();
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      const res = await apiRequest(API_ENDPOINTS.ME, { method: 'GET' });
      if (!mounted) return;
      if (!res.ok) {
        navigate('/login', { replace: true });
      } else {
        // Verificar el estado del servicio
        const serviceStatus = res.data?.user?.service_status;
        
        // Si require servicio y el usuario es NO_PURCHASED, redirigir a /no-purchased
        if (requireService && serviceStatus === 'NO_PURCHASED') {
          // Solo redirigir si no estamos ya en /no-purchased
          if (location.pathname !== '/no-purchased') {
            navigate('/no-purchased', { replace: true });
            return;
          }
        }
        
        // Si require servicio y el usuario es PENDING, redirigir a /pending
        if (requireService && serviceStatus === 'PENDING') {
          // Solo redirigir si no estamos ya en /pending
          if (location.pathname !== '/pending') {
            navigate('/pending', { replace: true });
            return;
          }
        }
        
        // Si está en /no-purchased pero YA tiene servicio, redirigir al dashboard
        if (location.pathname === '/no-purchased' && serviceStatus !== 'NO_PURCHASED') {
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Si está en /pending pero YA tiene servicio completado, redirigir al dashboard
        if (location.pathname === '/pending' && serviceStatus === 'COMPLETED') {
          navigate('/dashboard', { replace: true });
          return;
        }
        
        setOk(true);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate, location.pathname, requireService]);

  if (loading) return null;
  return ok ? children : null;
}
