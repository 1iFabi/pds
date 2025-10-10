import React, { useState, useMemo } from 'react';
import { updatePassword } from '../../services/auth.js';

const ResetPasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validación de contraseña en tiempo real
  const passwordValidation = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 10,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }
    
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await updatePassword(formData.password);
      if (!error) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(error.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ password: '', confirmPassword: '' });
    setError('');
    setSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordValidation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal" style={{ maxWidth: '550px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {success ? '¡Contraseña actualizada!' : 'Nueva Contraseña'}
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
                Tu contraseña ha sido actualizada exitosamente. La página se recargará automáticamente.
              </p>
            </>
          ) : (
            <>
              <p className="modal-description">
                Crea una nueva contraseña segura para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} className="forgot-password-form">
                {/* Nueva Contraseña */}
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
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setShowPasswordValidation(true)}
                    placeholder=" "
                    required
                    disabled={loading}
                  />
                  <label className="uv-label">Nueva Contraseña</label>
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

                {/* Validador de contraseña - JUSTO ABAJO DE NUEVA CONTRASEÑA */}
                <div className="password-validator" style={{ display: 'block', visibility: 'visible', opacity: 1, position: 'relative', left: 0, right: 0, width: '100%', marginTop: '12px', marginBottom: '12px' }}>
                  <div className={`validator-item ${passwordValidation.minLength ? 'valid' : 'invalid'}`}>
                    <span className="validator-icon">
                      {passwordValidation.minLength ? '✓' : '×'}
                    </span>
                    <span>Mínimo 10 caracteres</span>
                  </div>
                  <div className={`validator-item ${passwordValidation.hasUppercase ? 'valid' : 'invalid'}`}>
                    <span className="validator-icon">
                      {passwordValidation.hasUppercase ? '✓' : '×'}
                    </span>
                    <span>Una mayúscula</span>
                  </div>
                  <div className={`validator-item ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}>
                    <span className="validator-icon">
                      {passwordValidation.hasNumber ? '✓' : '×'}
                    </span>
                    <span>Un número</span>
                  </div>
                  <div className={`validator-item ${passwordValidation.hasSymbol ? 'valid' : 'invalid'}`}>
                    <span className="validator-icon">
                      {passwordValidation.hasSymbol ? '✓' : '×'}
                    </span>
                    <span>Un símbolo especial</span>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
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
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder=" "
                    required
                    disabled={loading}
                  />
                  <label className="uv-label">Confirmar Contraseña</label>
                  <span className="uv-focus-bg" />
                  <button
                    type="button"
                    className="pwd-toggle"
                    onClick={() => setShowConfirmPassword(s => !s)}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? (
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

                {/* Indicador de contraseñas coincidentes */}
                {formData.confirmPassword && (
                  <div className={`password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
                    <span className="validator-icon">
                      {passwordsMatch ? '✓' : '×'}
                    </span>
                    <span>{passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                  </div>
                )}

                {error && (
                  <div className="modal-error">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="modal-submit-btn"
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
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
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          overflow-x: visible;
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
          color: #4A90E2;
          background: rgba(74, 144, 226, 0.1);
        }

        .pwd-toggle:focus {
          outline: none;
          color: #4A90E2;
        }

        /* Estilos para validadores de contraseña */
        .password-validator {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin: 12px 0 !important;
          font-size: 14px;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 10;
        }

        .validator-item {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          transition: all 0.3s ease;
        }

        .validator-item:last-child {
          margin-bottom: 0;
        }

        .validator-icon {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .validator-item.valid .validator-icon {
          background: #10b981;
          color: white;
        }

        .validator-item.invalid .validator-icon {
          background: #ef4444;
          color: white;
        }

        .validator-item.valid {
          color: #065f46;
        }

        .validator-item.invalid {
          color: #991b1b;
        }

        /* Password match indicator */
        .password-match {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin: 8px 0;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .password-match.valid {
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #065f46;
        }

        .password-match.invalid {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .password-match .validator-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        .password-match.valid .validator-icon {
          background: #10b981;
          color: white;
        }

        .password-match.invalid .validator-icon {
          background: #ef4444;
          color: white;
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

export default ResetPasswordModal;
