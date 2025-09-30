// components/Register/Register.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api.js";
import "./Register.css";
// Reutilizamos los estilos del Login para el layout 50/50 y los inputs
import "../Login/Login.css";
import VerificationModal from "../Login/VerificationModal.jsx";

import logo from "/cNormal.png";
import cromo from "/login.png";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  // Modal de verificación tras registro
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

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
        const requiresVerification = !!result.data.requires_verification;
        const mensaje = result.data.mensaje || 'Usuario registrado exitosamente.';
        if (requiresVerification) {
          setVerificationMessage(mensaje);
          setShowVerificationModal(true);
        } else {
          setRegistrationSuccess(true);
          setShowSuccessModal(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
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

  const handleTermsClick = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
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
    <div className={`auth register-page register-layout mirror ${isTransitioning ? "page-exit" : "page-enter"}`}>
      {/* Lado izquierdo (idéntico layout al login) */}
      <section className="auth-left register-left">
        <div className="left-inner register-inner">
          {/* Solo la imagen del logo, sin texto "SeqUOH" */}
          <div className="logo-container">
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <img
                src={logo}
                alt="Logo"
                className="welcome-logo"
                draggable="false"
              />
            </button>
          </div>

          <h1 className="title register-title">Crea tu cuenta</h1>
          <p className="subtitle register-subtitle">Regístrate para acceder a tu perfil genético.</p>
          <div className="title-underline" />

          {/* Reutilizo la tarjeta/inputs del login para consistencia visual */}
          <form onSubmit={handleSubmit} className="login-form login-card register-form form-container">
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
            <div className="password-wrapper">
              <div className="uv-field password-field-container">
              <span className="uv-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-6 0V7a3 3 0 616 0v3h-6z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                className="uv-input"
                type={showPassword ? "text" : "password"}
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
              
              {/* Botón mostrar/ocultar contraseña */}
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex="-1"
              >
                {showPassword ? (
                  // Ícono de ojo tachado (ocultar)
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
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
            
            {/* Validador de contraseña - responsivo: derecha en desktop, abajo en móvil */}
            {(showPasswordValidation || formData.contraseña.length > 0) && (
              <div className="password-validator password-validator-responsive">
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
                    d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-6 0V7a3 3 0 616 0v3h-6z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                className={`uv-input ${formData.repetirContraseña && !passwordsMatch ? 'input-error' : ''}`}
                type={showConfirmPassword ? "text" : "password"}
                name="repetirContraseña"
                value={formData.repetirContraseña}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <label className="uv-label">Repetir contraseña</label>
              <span className="uv-focus-bg" />
              
              {/* Botón mostrar/ocultar contraseña de confirmación */}
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  // Ícono de ojo tachado (ocultar)
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
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
              <span>
                Acepto los{" "}
                <a 
                  href="#" 
                  onClick={handleTermsClick}
                  className="terms-link"
                  style={{
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: "pointer"
                  }}
                >
                  términos y condiciones
                </a>
              </span>
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

      {/* Modal de Verificación tras registro */}
      <VerificationModal 
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          navigate('/login');
        }}
        message={verificationMessage || 'Usuario registrado exitosamente. Debes verificar tu cuenta desde tu correo para poder continuar.'}
        title="Verificación requerida"
      />

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={handleCloseTermsModal}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h2>Términos y Condiciones de Genomia</h2>
              <button 
                className="terms-modal-close"
                onClick={handleCloseTermsModal}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="terms-modal-content">
              <p>Bienvenido a Genomia. Al utilizar nuestros servicios, usted acepta los siguientes términos y condiciones. Por favor, léalos con atención.</p>
              
              <h3>1. Aceptación de los Términos</h3>
              <p>Al acceder y utilizar nuestro sitio web y servicios, usted confirma que ha leído, entendido y aceptado estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá utilizar nuestros servicios.</p>
              
              <h3>2. Descripción del Servicio</h3>
              <p>Genomia ofrece servicios de análisis de ADN para determinar la ascendencia genética de nuestros usuarios, con un enfoque en la población chilena. Utilizamos bases de datos genéticas de referencia chilenas para proporcionar informes de ascendencia personalizados.</p>
              
              <h3>3. Requisitos para el Uso del Servicio</h3>
              <p>Para utilizar nuestros servicios, usted debe:</p>
              <ul>
                <li>Ser mayor de 18 años.</li>
                <li>Proporcionar una muestra de saliva para el análisis de ADN.</li>
                <li>Garantizar que la muestra de saliva que proporciona es suya.</li>
              </ul>
              
              <h3>4. Consentimiento Informado</h3>
              <p>El análisis genético es una decisión personal importante. Antes de utilizar nuestros servicios, usted debe otorgar su consentimiento informado, lo que significa que reconoce y acepta lo siguiente:</p>
              
              <h4>Naturaleza de la Información Genética:</h4>
              <p>Su información genética es única y personal. Los resultados de su análisis pueden revelar información inesperada sobre usted y su familia.</p>
              
              <h4>Uso de sus Datos:</h4>
              <p>Al aceptar estos términos, usted autoriza a Genomia a recolectar, procesar y almacenar su muestra de saliva y los datos genéticos derivados de ella con el fin de proporcionarle su informe de ascendencia.</p>
              
              <h4>Investigación y Desarrollo:</h4>
              <p>Usted puede optar por consentir que sus datos genéticos, de forma anónima y agregada, sean utilizados para fines de investigación y desarrollo para mejorar nuestros servicios y contribuir al conocimiento científico de la ascendencia chilena. Este consentimiento es voluntario y puede ser revocado en cualquier momento.</p>
              
              <h4>Riesgos y Limitaciones:</h4>
              <ul>
                <li>Los resultados de ascendencia son estimaciones basadas en los datos actuales y pueden cambiar a medida que la ciencia y nuestras bases de datos evolucionan.</li>
                <li>La información genética que comparte podría tener implicaciones sociales, legales o económicas.</li>
                <li>A pesar de nuestras medidas de seguridad, no podemos garantizar al 100% la seguridad de sus datos.</li>
              </ul>
              
              <h3>5. Privacidad y Protección de Datos</h3>
              <p>En Genomia, nos tomamos muy en serio su privacidad. Nuestra política de privacidad se rige por las Leyes N° 19.628 sobre Protección de la Vida Privada de Chile y la Ley N° 21.719 de Protección de datos.</p>
              
              <h4>Datos Sensibles:</h4>
              <p>Reconocemos que sus datos genéticos son "datos sensibles" según la legislación chilena. Nos comprometemos a protegerlos con los más altos estándares de seguridad.</p>
              
              <h4>Confidencialidad:</h4>
              <p>No compartiremos sus datos personales ni genéticos con terceros sin su consentimiento explícito, a menos que sea requerido por una orden judicial.</p>
              
              <h4>Derechos del Titular de los Datos:</h4>
              <p>Usted tiene derecho a:</p>
              <ul>
                <li>Acceder a sus datos personales y genéticos.</li>
                <li>Solicitar la rectificación o cancelación de sus datos.</li>
                <li>Oponerse al tratamiento de sus datos para fines que no sean los originalmente consentidos.</li>
              </ul>
              <p>Para ejercer estos derechos, puede contactarnos a través de Contacto.</p>
              
              <h4>Almacenamiento de Muestras:</h4>
              <p>Su muestra de saliva será almacenada de forma segura en nuestras instalaciones. Usted puede solicitar la destrucción de su muestra en cualquier momento.</p>
              
              <h3>6. Cuenta de Usuario y Seguridad</h3>
              <p>Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran en su cuenta. Notifíquenos inmediatamente sobre cualquier uso no autorizado de su cuenta.</p>
              
              <h3>7. Propiedad Intelectual</h3>
              <p>Todo el contenido de este sitio web, incluyendo textos, gráficos, logos e informes, es propiedad de Four Future S.A y está protegido por las leyes de propiedad intelectual.</p>
              
              <h3>8. Limitación de Responsabilidad</h3>
              <p>Genomia no será responsable por ninguna decisión o acción que usted tome basada en los resultados de su análisis de ascendencia. El servicio se proporciona "tal cual" y no garantizamos que los resultados sean 100% precisos o completos.</p>
              
              <h3>9. Modificaciones a los Términos y Condiciones</h3>
              <p>Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia desde su publicación en nuestro sitio web. Le recomendamos revisar esta página periódicamente.</p>
              
              <h3>10. Ley Aplicable y Jurisdicción</h3>
              <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República de Chile. Cualquier disputa que surja en relación con estos términos será sometida a la jurisdicción de los tribunales de Rancagua, Chile.</p>
              
              <h3>11. Contacto</h3>
              <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos en: seq@uoh.cl.</p>
            </div>
            <div className="terms-modal-footer">
              <button 
                className="terms-modal-accept"
                onClick={handleCloseTermsModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
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
            <h2 className="success-title">Registro exitoso</h2>
            <p className="success-message">Redirigiendo al login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;