import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resendVerification } from '../services/auth.js';
import './EmailVerification.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'expired'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    // Supabase devuelve en el hash: #access_token=...&type=signup
    const hash = window.location.hash || '';
    const isSignup = hash.includes('type=signup');
    if (isSignup) {
      setStatus('success');
      setMessage('¡Email verificado! Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setStatus('error');
      setMessage('No se encontró un enlace de verificación válido.');
    }
  }, [navigate]);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendStatus('error');
      return;
    }
    setResendStatus('sending');
    try {
      const { error } = await resendVerification(resendEmail.trim());
      if (!error) {
        setResendStatus('success');
        setResendEmail('');
      } else {
        setResendStatus('error');
      }
    } catch (_) {
      setResendStatus('error');
    }
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="verification-header">
          <div className={`verification-icon ${status}`}>
            {status === 'loading' && <div className="spinner"></div>}
            {status === 'success' && <span>✅</span>}
            {status === 'error' && <span>❌</span>}
            {status === 'expired' && <span>⏰</span>}
          </div>
          <h1 className="verification-title">
            {status === 'loading' && 'Verificando Email...'}
            {status === 'success' && '¡Email Verificado!'}
            {status === 'error' && 'Error de Verificación'}
            {status === 'expired' && 'Token Expirado'}
          </h1>
        </div>

        <div className="verification-content">
          <p className={`verification-message ${status}`}>
            {message}
          </p>

          {status === 'success' && (
            <div className="success-actions">
              <p className="redirect-notice">
                Serás redirigido al login automáticamente...
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="btn-login"
              >
                Ir al Login Ahora
              </button>
            </div>
          )}

          {(status === 'error' || status === 'expired') && (
            <div className="error-actions">
              <div className="resend-section">
                <h3>¿Necesitas un nuevo enlace?</h3>
                <p>Ingresa tu email para recibir un nuevo enlace de verificación:</p>
                
                <form onSubmit={handleResendVerification} className="resend-form">
                  <div className="input-group">
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="tu-email@ejemplo.com"
                      required
                      className="email-input"
                    />
                    <button 
                      type="submit" 
                      disabled={resendStatus === 'sending'}
                      className="btn-resend"
                    >
                      {resendStatus === 'sending' ? 'Enviando...' : 'Reenviar'}
                    </button>
                  </div>
                  
                  {resendStatus === 'success' && (
                    <p className="resend-success">
                      ✅ Email de verificación enviado exitosamente
                    </p>
                  )}
                  
                  {resendStatus === 'error' && (
                    <p className="resend-error">
                      ❌ Error enviando el email. Inténtalo de nuevo.
                    </p>
                  )}
                </form>
              </div>

              <div className="alternative-actions">
                <button 
                  onClick={() => navigate('/register')}
                  className="btn-secondary"
                >
                  Volver al Registro
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="btn-tertiary"
                >
                  Ir al Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;