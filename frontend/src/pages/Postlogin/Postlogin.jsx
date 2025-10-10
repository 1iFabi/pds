import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { getUser, signOut } from '../../services/auth.js';

const Postlogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await getUser();
      if (!mounted) return;

      if (error || !data?.user) {
        navigate('/login', { replace: true });
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        ...data.user.user_metadata,
      });
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
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
