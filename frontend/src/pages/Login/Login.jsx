import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signIn, signOut as _signOut } from "../../services/auth.js";
import ErrorMessage from "../../components/Errormessage.jsx";
import "./Login.css";
import ForgotPasswordModal from "./ForgotPasswordModal.jsx";
import ResetPasswordModal from "./ResetPasswordModal.jsx";
import VerificationModal from "./VerificationModal.jsx";
import logo from "/cNormal.png";
import cromo from "/login.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Limpiar error del campo al escribir
    setErrors((prev) => ({ ...prev, [name === 'email' ? 'email' : name]: '' }));
  };

  // Si el usuario llega a /login con una sesión activa, cerrarla
  useEffect(() => {
    // Ensure any lingering app-local token is cleared by signing out previous sessions
    (async () => {
      try { await _signOut(); } catch {}
    })();
  }, []);

// Detectar si hay un token de reset en la URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Mostrar SOLO el modal de restablecer contraseña, sin modales intermedios
      setResetToken(token);
      setShowResetPassword(true);
      // Limpiar la URL después de obtener el token
      window.history.replaceState({}, document.title, '/login');
    }
  }, [searchParams]);

// Leer cookies de verificación Y parámetro verified en URL
  useEffect(() => {
    const getCookie = (name) => {
      const cookies = document.cookie.split('; ');
      const found = cookies.find(row => row.startsWith(name + '='));
      return found ? found.split('=')[1] : null;
    };

    // Primero verificar si hay parámetro verified en URL
    const verifiedParam = searchParams.get('verified');
    
    // Leer cookies
    const status = getCookie('verification_status');
    let message = getCookie('verification_message');

    // Debug: ver qué recibimos
    console.log('[Verification Check]', { verifiedParam, status, message, allCookies: document.cookie });

    // Si hay verified=1 en URL o cookie de status
    if (verifiedParam === '1' || status === '1') {
      let finalMessage = 'Tu cuenta fue verificada correctamente. Ya puedes iniciar sesión.';
      
      if (message) {
        try {
          finalMessage = decodeURIComponent(message);
          // Quitar comillas envolventes si las hay
          if ((finalMessage.startsWith('"') && finalMessage.endsWith('"')) || 
              (finalMessage.startsWith("'") && finalMessage.endsWith("'"))) {
            finalMessage = finalMessage.slice(1, -1);
          }
        } catch (e) {
          console.error('Error decoding message:', e);
        }
      }
      
      setVerificationMessage(finalMessage);
      setShowVerificationModal(true);

      // Limpiar cookies y URL
      document.cookie = 'verification_status=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie = 'verification_message=; Max-Age=0; Path=/; SameSite=Lax';
      if (verifiedParam) {
        window.history.replaceState({}, document.title, '/login');
      }
    } else if (status === '0') {
      // Error en verificación
      let errorMsg = 'Ocurrió un error al verificar la cuenta.';
      if (message) {
        try {
          errorMsg = decodeURIComponent(message);
          if ((errorMsg.startsWith('"') && errorMsg.endsWith('"')) || 
              (errorMsg.startsWith("'") && errorMsg.endsWith("'"))) {
            errorMsg = errorMsg.slice(1, -1);
          }
        } catch (e) {}
      }
      setVerificationMessage(errorMsg);
      setShowVerificationModal(true);
      
      // Limpiar cookies
      document.cookie = 'verification_status=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie = 'verification_message=; Max-Age=0; Path=/; SameSite=Lax';
    }
  }, [searchParams]);

  const [errors, setErrors] = useState({ email: '', password: '', global: '' });
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Modal de verificación de cuenta (via cookies)
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: '', password: '', global: '' });
    
    try {
      const { data, error } = await signIn(form.email, form.password);
      if (!error && data?.user) {
        setLoginSuccess(true);
        setShowSuccessModal(true);
        setTimeout(() => {
          // Generar session ID único y legible
          const generateSessionId = () => {
            const timestamp = Date.now().toString(36);
            const randomPart = Math.random().toString(36).substring(2, 9);
            return `${timestamp}${randomPart}`.toUpperCase();
          };
          const sessionId = generateSessionId();
          navigate(`/dashboard?session=${sessionId}`);
        }, 600);
      } else {
        // Mapear error genérico
        let fieldErrors = { email: '', password: '', global: '' };
        // Supabase devuelve error.message descriptivo
        fieldErrors.global = 'Credenciales inválidas';
        fieldErrors.email = 'error';
        fieldErrors.password = 'error';
        setErrors(fieldErrors);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setErrors({ email: '', password: '', global: 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    
    // Esperar a que termine la animación de salida
    setTimeout(() => {
      navigate('/register');
    }, 150); // ← Reducido de 300ms a 150ms
  };

  return (
    <div className={`auth login-page ${isTransitioning ? 'page-exit' : 'page-enter'}`}>
      {/* Columna izquierda */}
      <section className="auth-left">
        <div className="left-inner">
          <div className="logo-container">
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <img src={logo} alt="Logo cNormal" className="welcome-logo" draggable="false" />
            </button>
          </div>
          <h1 className="title">¡Bienvenido!</h1>
          <p className="subtitle">Ingresa tu correo y contraseña para acceder a tu cuenta.</p>
          <div className="title-underline" />

          <form onSubmit={handleSubmit} className="login-form login-card form-container">
            {/* Email */}
            <div className="field-with-error-wrapper">
              <div className={`uv-field ${errors.email ? 'has-error' : ''}`}>
                <span className="uv-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M20 8l-8 5-8-5V6l8 5 8-5v2zm0 3v7H4v-7l8 5 8-5z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  className={`uv-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="username"
                  placeholder=" "
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                <label className="uv-label">Correo</label>
                <span className="uv-focus-bg" />
              </div>
              {errors.email && errors.email !== 'error' && (
                <div className="error-message-right">
                  <ErrorMessage message={errors.email} small={true} />
                </div>
              )}
            </div>

            {/* Password */}
            <div className="field-with-error-wrapper">
              <div className={`uv-field ${errors.password ? 'has-error' : ''}`}>
                <span className="uv-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-6 0V7a3 3 0 016 0v3h-6z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  className={`uv-input ${errors.password ? 'error' : ''}`}
                  type={showPwd ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                  placeholder=" "
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <label className="uv-label">Contraseña</label>
                <span className="uv-focus-bg" />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex="-1"
                >
                  {showPwd ? (
                    // Ícono de ojo tachado (ocultar)
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    // Ícono de ojo normal (mostrar)
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && errors.password !== 'error' && (
                <div className="error-message-right">
                  <ErrorMessage message={errors.password} small={true} />
                </div>
              )}
            </div>

            {/* Botón de login */}
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresa tu cuenta"}
            </button>

            {/* Errores ocultos - solo se muestran visualmente con bordes rojos */}

            {/* Mostrar mensaje de éxito */}
            {loginSuccess && (
              <div className="login-success" style={{
                color: '#155724',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                ¡Login exitoso!
              </div>
            )}


            <p className="login-help">
              ¿No tienes cuenta?{" "}
              <a className="login-link" href="#" onClick={handleRegisterClick}>
                Regístrate
              </a>
            </p>

            <button 
              type="button" 
              className="login-link subtle"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </div>
      </section>

      {/* Columna derecha (imagen) */}
      <section className="auth-right">
        <img src={cromo} alt="imagen de cromosomas" />
      </section>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none">
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="#10b981" 
                  strokeWidth="2.5"
                  strokeDasharray="63"
                  strokeDashoffset="63"
                  className="success-circle"
                />
                <path 
                  d="M9 12l2 2 4-4" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  strokeDasharray="8"
                  strokeDashoffset="8"
                  className="success-check"
                />
              </svg>
            </div>
            <h2 className="success-title">Login exitoso</h2>
            <p className="success-message">Redirigiendo al dashboard...</p>
          </div>
        </div>
      )}

      {/* Modal de recuperación de contraseña */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      {/* Modal de restablecimiento de contraseña */}
      <ResetPasswordModal 
        isOpen={showResetPassword}
        onClose={() => {
          setShowResetPassword(false);
          setResetToken('');
        }}
        token={resetToken}
      />

      {/* Modal de verificación de cuenta reutilizando estilos del modal de recuperación */}
      <VerificationModal 
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        message={verificationMessage || 'Tu cuenta fue verificada correctamente.'}
      />
    </div>
  );
}
