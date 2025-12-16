import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest, getToken } from '../config/api';

export default function ProtectedRoute({ children, requireService = true, requireAdmin = false }) {
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
        const isStaff = res.data?.user?.is_staff === true;
        if (requireAdmin && !isStaff) {
          navigate('/dashboard', { replace: true });
          return;
        }

        const serviceStatus = res.data?.user?.service_status;
        if (requireService && serviceStatus === 'NO_PURCHASED') {
          if (location.pathname !== '/no-purchased') {
            navigate('/no-purchased', { replace: true });
            return;
          }
        }
        if (requireService && serviceStatus === 'PENDING') {
          if (location.pathname !== '/pending') {
            navigate('/pending', { replace: true });
            return;
          }
        }
        if (location.pathname === '/no-purchased' && serviceStatus !== 'NO_PURCHASED') {
          navigate('/dashboard', { replace: true });
          return;
        }
        if (location.pathname === '/pending' && serviceStatus === 'COMPLETED') {
          navigate('/dashboard', { replace: true });
          return;
        }
        setOk(true);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate, location.pathname, requireService, requireAdmin]);

  if (loading) return null;
  return ok ? children : null;
}
