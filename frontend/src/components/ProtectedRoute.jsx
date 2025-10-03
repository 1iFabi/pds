import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest, getToken } from '../config/api';

export default function ProtectedRoute({ children }) {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        setOk(true);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading) return null;
  return ok ? children : null;
}
