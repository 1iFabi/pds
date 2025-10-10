import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ResetPasswordModal from './ResetPasswordModal.jsx';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Supabase incluye tokens en el hash: #access_token=...&type=recovery
    const hasRecovery = window.location.hash.includes('type=recovery');
    if (!hasRecovery) {
      navigate('/login');
      return;
    }
    setOpen(true);
  }, [searchParams, navigate]);

  return (
    <div className="auth login-page" style={{ minHeight: '100vh' }}>
      <ResetPasswordModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          navigate('/login');
        }}
      />
    </div>
  );
};

export default ResetPasswordPage;
