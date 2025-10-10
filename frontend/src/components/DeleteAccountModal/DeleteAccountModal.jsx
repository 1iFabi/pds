import React, { useState } from 'react';
import { signOut } from '../../services/auth.js';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose, userName }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Debes ingresar tu contraseña');
      return;
    }

    if (confirmText.toLowerCase() !== 'eliminar') {
      setError('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Eliminación de cuenta requiere Service Role/servidor. Deshabilitado en frontend.
      setError('Esta acción requiere confirmación desde el servidor. Por ahora, no es posible eliminar la cuenta desde la app.');
      // Como alternativa, cerramos sesión para seguridad
      await signOut();
    } catch (error) {
      console.error('Error:', error);
      setError('Ocurrió un error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // No permitir cerrar durante la eliminación
    setPassword('');
    setConfirmText('');
    setError('');
    setSuccess(false);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="delete-account-overlay">
      <div className="delete-account-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {success ? 'Cuenta Eliminada' : 'Eliminar Cuenta'}
          </h2>
          {!loading && (
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
          )}
        </div>

        {/* Content */}
        <div className="modal-content">
          {success ? (
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
                Tu cuenta ha sido eliminada. Serás redirigido al inicio en un momento.
              </p>
            </>
          ) : (
            <>
              <div className="warning-banner">
                <svg viewBox="0 0 24 24" width="24" height="24" className="warning-icon">
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <h3 className="warning-title">Acción Irreversible</h3>
              <p className="warning-text">
                Esta acción requiere confirmación desde el servidor (Service Role).
                Por ahora, no es posible eliminar la cuenta desde la app. Si deseas continuar, contáctanos para gestionar la eliminación.
              </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="delete-account-form">
                {/* Campo de contraseña */}
                <div className="uv-field">
                  <span className="uv-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path
                        d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-6 0V7a3 3 0 016 0v3h-6z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <input
                    className="uv-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    required
                    disabled={loading}
                  />
                  <label className="uv-label">Confirma tu Contraseña</label>
                  <span className="uv-focus-bg" />
                  <button
                    type="button"
                    className="pwd-toggle"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z"
                          fill="currentColor"
                        />
                        <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Campo de confirmación */}
                <div className="confirmation-field">
                  <label className="confirmation-label">
                    Escribe <strong>ELIMINAR</strong> para confirmar:
                  </label>
                  <input
                    className="confirmation-input"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="ELIMINAR"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="modal-error">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="modal-delete-btn"
                  disabled={loading || !password || confirmText.toLowerCase() !== 'eliminar'}
                >
                  {loading ? 'Eliminando cuenta...' : 'Eliminar Cuenta Permanentemente'}
                </button>

                <p className="disclaimer-text">
                  {userName && `Hola ${userName}, `}
                  una vez eliminada tu cuenta, no podrás recuperarla ni acceder a tus datos genéticos.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .delete-account-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .delete-account-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
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
          color: #dc2626;
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
          background: #fee2e2;
          color: #dc2626;
        }

        .modal-content {
          padding: 0 24px 24px;
        }

        .warning-banner {
          display: flex;
          gap: 12px;
          background: #fef2f2;
          border: 2px solid #fecaca;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .warning-icon {
          color: #dc2626;
          flex-shrink: 0;
        }

        .warning-title {
          font-size: 16px;
          font-weight: 700;
          color: #991b1b;
          margin: 0 0 6px 0;
        }

        .warning-text {
          font-size: 14px;
          color: #7f1d1d;
          line-height: 1.5;
          margin: 0;
        }

        .delete-account-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .confirmation-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .confirmation-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .confirmation-label strong {
          color: #dc2626;
          font-weight: 700;
        }

        .confirmation-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: #fafafa;
          color: #374151;
          transition: all 0.3s ease;
          font-family: inherit;
          font-weight: 600;
          text-transform: uppercase;
        }

        .confirmation-input:focus {
          outline: none;
          border-color: #dc2626;
          background: white;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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

        .modal-delete-btn {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-delete-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5);
        }

        .modal-delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .disclaimer-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          text-align: center;
          margin: 0;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
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

        /* Reutilizar estilos de campos */
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
          border-color: #dc2626;
          background: white;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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
          color: #dc2626;
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
          color: #dc2626;
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

        .pwd-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .pwd-toggle:hover {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .pwd-toggle:focus {
          outline: none;
          color: #dc2626;
        }

        @media (max-width: 480px) {
          .delete-account-modal {
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

export default DeleteAccountModal;
