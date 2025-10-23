import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { API_ENDPOINTS, apiRequest, clearToken } from '../../config/api';

const PostloginUser = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const navigate = useNavigate();

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

  return <Dashboard user={user} onLogout={handleLogout} onDownload={handleDownload} />;
};

export default PostloginUser;
