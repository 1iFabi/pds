import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'expired'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Token de verificación no encontrado en la URL');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.VERIFY_EMAIL, {
        method: 'POST',
        body: JSON.stringify({ token: verificationToken }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage(response.data.message || 'Email verificado exitosamente');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
              type: 'success'
            }
          });
        }, 3000);
      } else {
        if (response.data.error?.includes('expirado')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
        setMessage(response.data.error || 'Error verificando el email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!resendEmail.trim()) {
      setResendStatus('error');
      return;
    }

    setResendStatus('sending');
    
    try {
      const response = await apiRequest(API_ENDPOINTS.RESEND_VERIFICATION, {
        method: 'POST',
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      if (response.ok) {
        setResendStatus('success');
        setResendEmail('');
      } else {
        setResendStatus('error');
      }
    } catch (error) {
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