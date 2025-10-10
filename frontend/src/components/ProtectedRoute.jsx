import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/auth.js';

export default function ProtectedRoute({ children }) {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await getUser();
      if (!mounted) return;
      if (error || !data?.user) {
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
