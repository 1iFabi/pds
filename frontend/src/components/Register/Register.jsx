// components/Register/Register.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api.js";
import "./Register.css";
// Reutilizamos los estilos del Login para el layout 50/50 y los inputs
import "../Login/Login.css";

import logo from "/public/cNormal.png";
import cromo from "/public/login.png";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    contraseña: "",
    repetirContraseña: "",
    correo: "",
    telefono: "",
    terminos: false,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Validación de contraseña en tiempo real
  const passwordValidation = useMemo(() => {
    const password = formData.contraseña;
    return {
      minLength: password.length >= 10,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [formData.contraseña]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.contraseña === formData.repetirContraseña && formData.repetirContraseña !== '';

  // Validación de teléfono
  const phoneValidation = useMemo(() => {
    const phone = formData.telefono;
    return {
      isNumeric: /^\d*$/.test(phone),
      maxLength: phone.length <= 11,
    };
  }, [formData.telefono]);

  const isPhoneValid = Object.values(phoneValidation).every(Boolean);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      alert('La contraseña no cumple con todos los requisitos');
      return;
    }
    
    if (!passwordsMatch) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!formData.terminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    setIsLoading(true);
    setRegistrationError('');
    
    try {
      const result = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono,
          contraseña: formData.contraseña,
          repetirContraseña: formData.repetirContraseña,
          terminos: formData.terminos
        }),
      });
      
      if (result.ok && result.data.success) {
        setRegistrationSuccess(true);
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        // Redirigir al login después de un registro exitoso
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setRegistrationError(result.data.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setRegistrationError('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
    }
      setIsLoading(false);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/login");
    }, 150);
  };

  const handlePasswordFocus = () => {
    setShowPasswordValidation(true);
  };

  const handlePasswordBlur = () => {
    // Solo ocultar si no estamos interactuando con el validador
    setTimeout(() => {
      // Si no hay contenido o ya está válida, ocultar
      if (formData.contraseña.length === 0 || isPasswordValid) {
        setShowPasswordValidation(false);
      }
    }, 150);
  };

  // Función para ocultar validador cuando se hace click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPasswordValidation && 
          !event.target.closest('.password-field-container') &&
          !event.target.closest('.password-validator')) {
        setShowPasswordValidation(false);
      }
    };

    if (showPasswordValidation) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPasswordValidation]);

return (
    <div className={`auth register-layout mirror ${isTransitioning ? "page-exit" : "page-enter"}`}>
      {/* Lado izquierdo (idéntico layout al login) */}
      <section className="auth-left register-left">
        <div className="left-inner register-inner">
          {/* Solo la imagen del logo, sin texto "SeqUOH" */}
          <div className="logo-container">
            <a href="/">
              <img
                src={logo}
                alt="Logo"
                className="welcome-logo"
                draggable="false"
              />
            </a>
          </div>

          <h1 className="title register-title">Crea tu cuenta</h1>
          <p className="subtitle register-subtitle">Regístrate para acceder a tu perfil genético.</p>
          <div className="title-underline" />

          {/* Reutilizo la tarjeta/inputs del login para consistencia visual */}
          <form onSubmit={handleSubmit} className="login-form login-card register-form">
            {/* Nombre */}
            <div className="uv-field">
              <span className="uv-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                className="uv-input"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <label className="uv-label">Nombre</label>
              <span className="uv-focus-bg" />
            </div>

            {/* Correo */}
            <div className="uv-field">
              <span className="uv-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M20 8l-8 5-8-5V6l8 5 8-5v2zm0 3v7H4v-7l8 5 8-5z" fill="currentColor" />
                </svg>
              </span>
              <input
                className="uv-input"
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <label className="uv-label">Correo</label>
              <span className="uv-focus-bg" />
            </div>

            {/* Teléfono */}
            <div className="uv-field">
              <span className="uv-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.1 2 2 0 014.1 2h3a2 2 0 012 1.72c.07.96.27 1.9.7 2.81a2 2 0 01-.45 2.11L8.1 9.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.43 1.85.63 2.81.7A2 2 0 0122 16.92z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                className="uv-input"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value.length <= 11) {
                    handleInputChange(e);
                  }
                }}
                placeholder=" "
                required
              />
              <label className="uv-label">Teléfono</label>
              <span className="uv-focus-bg" />
              {!isPhoneValid && (
                <div className="validation-error">
                  {phoneValidation.isNumeric ? "" : "Solo se permiten números."}
                  {phoneValidation.maxLength ? "" : "Máximo 11 dígitos."}
                </div>
              )}
            </div>

            {/* Contraseña con validación */}
            <div className="uv-field password-field-container">
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
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                placeholder=" "
                required
              />
              <label className="uv-label">Contraseña</label>
              <span className="uv-focus-bg" />
              
              {/* Validador de contraseña */}
              {(showPasswordValidation || formData.contraseña.length > 0) && (
                <div className="password-validator">
                  <div className="validator-header">
                    <span className="validator-title">Requisitos:</span>
                  </div>
                  <div className="validator-rules">
                    <div className={`validator-rule ${passwordValidation.minLength ? 'valid' : 'invalid'}`}>
                      <span className="validator-icon">
                        {passwordValidation.minLength ? '✓' : '×'}
                      </span>
                      <span className="validator-text">Mínimo 10 caracteres</span>
                    </div>
                    <div className={`validator-rule ${passwordValidation.hasUppercase ? 'valid' : 'invalid'}`}>
                      <span className="validator-icon">
                        {passwordValidation.hasUppercase ? '✓' : '×'}
                      </span>
                      <span className="validator-text">1 letra mayúscula</span>
                    </div>
                    <div className={`validator-rule ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}>
                      <span className="validator-icon">
                        {passwordValidation.hasNumber ? '✓' : '×'}
                      </span>
                      <span className="validator-text">1 número</span>
                    </div>
                    <div className={`validator-rule ${passwordValidation.hasSymbol ? 'valid' : 'invalid'}`}>
                      <span className="validator-icon">
                        {passwordValidation.hasSymbol ? '✓' : '×'}
                      </span>
                      <span className="validator-text">1 símbolo (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Repetir contraseña */}
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
                className={`uv-input ${formData.repetirContraseña && !passwordsMatch ? 'input-error' : ''}`}
                type="password"
                name="repetirContraseña"
                value={formData.repetirContraseña}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <label className="uv-label">Repetir contraseña</label>
              <span className="uv-focus-bg" />
              {formData.repetirContraseña && !passwordsMatch && (
                <div className="password-error">Las contraseñas no coinciden</div>
              )}
            </div>

            {/* Términos */}
            <label className="checkbox-line">
              <input
                type="checkbox"
                name="terminos"
                checked={formData.terminos}
                onChange={handleInputChange}
                required
              />
              <span>Acepto los términos y condiciones</span>
            </label>

            {/* Mostrar errores de registro */}
            {registrationError && (
              <div className="registration-error" style={{
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                {registrationError}
              </div>
            )}
            
            {/* Mostrar mensaje de éxito */}
            {registrationSuccess && (
              <div className="registration-success" style={{
                color: '#155724',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                ¡Registro exitoso! Redirigiendo al login...
              </div>
            )}

            <button 
              type="submit" 
              className={`login-button ${(!isPasswordValid || !passwordsMatch || isLoading) ? 'button-disabled' : ''}`}
              disabled={!isPasswordValid || !passwordsMatch || isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>

            <p className="login-help">
              ¿Ya tienes cuenta?{" "}
              <a className="login-link" href="#login" onClick={handleLoginClick}>
                Inicia sesión
              </a>
            </p>
          </form>
        </div>
      </section>

      {/* Lado derecho: misma imagen del login */}
      <section className="auth-right register-right">
        <img src={cromo} alt="imagen de cromosomas" />
      </section>
    </div>
  );
};

export default Register;