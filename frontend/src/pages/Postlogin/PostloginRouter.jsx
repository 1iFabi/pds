import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest } from '../../config/api';
import PostloginUser from './PostloginUser';
import PostloginAdmin from './PostloginAdmin';
import AdminReports from './AdminReports';

const PostloginRouter = () => {
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

  if (loading) {
    return null;
  }

  // Detectar si el usuario es staff (administrador)
  const isStaff = user?.is_staff === true;

  if (isStaff) {
    return (
      <Routes>
        <Route path="/" element={<PostloginAdmin user={user} />} />
        <Route path="admin/reports" element={<AdminReports user={user} />} />
      </Routes>
    );
  }

  return <PostloginUser user={user} />;
};

export default PostloginRouter;
