import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/auth.js';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await requestPasswordReset(email, `${window.location.origin}/reset-password`);
      if (!error) {
        setStep('success');
        setMessage('Si el correo existe, te enviamos un enlace para restablecer la contraseña.');
      } else {
        setError(error.message || 'Error al enviar el correo de recuperación');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    setStep('form');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 'form' ? '¿Olvidaste tu contraseña?' : 'Correo enviado'}
          </h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {step === 'form' ? (
            <>
              <p className="modal-description">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="uv-field">
                  <span className="uv-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path
                        d="M20 8l-8 5-8-5V6l8 5 8-5v2zm0 3v7H4v-7l8 5 8-5z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <input
                    className="uv-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    required
                    disabled={loading}
                  />
                  <label className="uv-label">Correo electrónico</label>
                  <span className="uv-focus-bg" />
                </div>

                {error && (
                  <div className="modal-error">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="modal-submit-btn"
                  disabled={loading || !email.trim()}
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              <p className="success-message">
                {message}
              </p>

              <div className="success-note">
                <strong>Nota:</strong> Revisa tu bandeja de entrada y carpeta de spam. 
                El enlace expirará en 24 horas por seguridad.
              </div>

              <button 
                className="modal-submit-btn"
                onClick={handleClose}
              >
                Entendido
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .forgot-password-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .forgot-password-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .modal-close-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-content {
          padding: 0 24px 24px;
        }

        .modal-description {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .forgot-password-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-error {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          text-align: center;
        }

        .modal-submit-btn {
          background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
        }

        .modal-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
        }

        .modal-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .success-icon {
          text-align: center;
          margin-bottom: 20px;
          color: #059669;
        }

        .success-message {
          color: #1f2937;
          font-size: 16px;
          line-height: 1.5;
          text-align: center;
          margin: 0 0 20px 0;
        }

        .success-note {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 16px;
          font-size: 14px;
          color: #92400e;
          margin-bottom: 24px;
        }

        /* Reutilizar estilos de campos del login */
        .uv-field {
          position: relative;
          margin-bottom: 0;
        }

        .uv-input {
          width: 100%;
          padding: 16px 50px 16px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: #fafafa;
          color: #374151;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .uv-input:focus {
          outline: none;
          border-color: #4A90E2;
          background: white;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .uv-input:not(:placeholder-shown) {
          background: white;
        }

        .uv-label {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #9ca3af;
          pointer-events: none;
          transition: all 0.3s ease;
          background: linear-gradient(to bottom, transparent 0%, transparent 45%, #fafafa 45%, #fafafa 55%, transparent 55%);
          padding: 0 8px;
        }

        .uv-input:focus + .uv-label,
        .uv-input:not(:placeholder-shown) + .uv-label {
          top: 0;
          font-size: 14px;
          color: #4A90E2;
          font-weight: 500;
          background: linear-gradient(to bottom, transparent 0%, transparent 45%, white 45%, white 55%, transparent 55%);
        }

        .uv-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          z-index: 1;
        }

        .uv-input:focus ~ .uv-icon {
          color: #4A90E2;
        }

        .uv-focus-bg {
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          background: transparent;
          border-radius: 10px;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        @media (max-width: 480px) {
          .forgot-password-modal {
            margin: 0 10px;
          }

          .modal-header {
            padding: 20px 20px 0;
          }

          .modal-content {
            padding: 0 20px 20px;
          }

          .modal-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordModal;