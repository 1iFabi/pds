import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ResetPasswordModal from './ResetPasswordModal.jsx';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      // Si no hay token, redirigir a login
      navigate('/login');
      return;
    }
    setToken(t);
    setOpen(true);
  }, [searchParams, navigate]);

  return (
    <div className="auth login-page" style={{ minHeight: '100vh' }}>
      <ResetPasswordModal
        isOpen={open}
        token={token}
        onClose={() => {
          setOpen(false);
          navigate('/login');
        }}
      />
    </div>
  );
};

export default ResetPasswordPage;
