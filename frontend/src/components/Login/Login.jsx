import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api.js";
import "./Login.css";
import logo from "/public/cNormal.png";
import cromo from "/public/login.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          username: form.email,  // El backend espera username
          password: form.password
        }),
      });
      
      if (result.ok && result.data.success) {
        setLoginSuccess(true);
        setShowSuccessModal(true);
        // Redirigir después de mostrar el modal
        setTimeout(() => {
          navigate('/dashboard'); // Redirige al dashboard
        }, 2000);
      } else {
        setLoginError(result.data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setLoginError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
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
    <div className={`auth ${isTransitioning ? 'page-exit' : 'page-enter'}`}>
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

          <form onSubmit={handleSubmit} className="login-form login-card">
            {/* Email */}
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
                name="email"
                value={form.email}
                onChange={onChange}
                autoComplete="username"
                placeholder=" "
                required
              />
              <label className="uv-label">Correo</label>
              <span className="uv-focus-bg" />
            </div>

            {/* Password */}
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
                type={showPwd ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                placeholder=" "
                required
              />
              <label className="uv-label">Contraseña</label>
              <span className="uv-focus-bg" />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPwd ? (
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

            {/* Botón de login */}
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresa tu cuenta"}
            </button>

            {/* Mostrar errores de login - centrado y cerca del botón */}
            {loginError && (
              <div className="login-error" style={{
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '8px 12px',
                marginTop: '8px',
                marginBottom: '0px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {loginError}
              </div>
            )}
            
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

            <a href="#" className="login-link subtle">
              ¿Olvidaste tu contraseña?
            </a>
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
    </div>
  );
}
