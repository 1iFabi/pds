import React, { useState } from "react";
import { HashLink } from 'react-router-hash-link';
import { apiRequest, API_ENDPOINTS } from "../../config/api";
import "./Contacto.css";

export default function Contacto() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const handleTermsClick = (e) => { e.preventDefault(); setShowTermsModal(true); };
  const handleCloseTermsModal = () => setShowTermsModal(false);
  
  // Estados para el formulario de contacto
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensaje de error/éxito al escribir
    if (submitMessage.text) {
      setSubmitMessage({ type: '', text: '' });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/auth/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitMessage({ 
          type: 'success', 
          text: data.message || 'Tu mensaje ha sido enviado correctamente. Te responderemos pronto.' 
        });
        // Limpiar formulario
        setFormData({ nombre: '', email: '', mensaje: '' });
      } else {
        setSubmitMessage({ 
          type: 'error', 
          text: data.error || 'Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.' 
        });
      }
    } catch (error) {
      setSubmitMessage({ 
        type: 'error', 
        text: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'ok' | 'error', msg: string }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSending(true);
    try {
      const resp = await apiRequest(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          mensaje: form.mensaje.trim(),
        }),
      });
      if (resp.ok) {
        setFeedback({ type: 'ok', msg: '¡Gracias! Tu mensaje fue enviado.' });
        setForm({ nombre: "", email: "", mensaje: "" });
      } else {
        const err = resp.data?.error || 'No se pudo enviar el mensaje. Inténtalo nuevamente.';
        setFeedback({ type: 'error', msg: err });
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Error de conexión. Revisa tu red.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="ft" id="contacto" role="contentinfo" data-nav-theme="light">
      <div className="ft__top">
        <div className="ft__cols">
          {/* Columna izquierda: Logo + Menú */}
          <div className="ft__col ft__brand-menu">
            <nav className="ft__menu" aria-label="Menú">
              <h4 className="ft__title">Menú</h4>
              <ul className="ft__list">
                <li><HashLink smooth to="/#inicio">Inicio</HashLink></li>
                <li><HashLink smooth to="/#learn-more">Descubre</HashLink></li>
                <li><HashLink smooth to="/#conoce">Conoce</HashLink></li>
                <li><HashLink smooth to="/#obten">Obtén el Tuyo</HashLink></li>
                <li><HashLink smooth to="/#preguntas">Preguntas Frecuentes</HashLink></li>
                <li><HashLink smooth to="/#equipo">Equipo</HashLink></li>
                <li><HashLink smooth to="/#contacto">Contacto</HashLink></li>
              </ul>
            </nav>
          </div>

          {/* Columna centro: Información (no links) */}
          <section className="ft__col ft__info-col" aria-label="Información">
            <h4 className="ft__title">Información</h4>
            <ul className="ft__info">
              <li className="ft__info-item">
                <span className="ft__info-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z"/></svg>
                </span>
                <div className="ft__info-body">
                  <div className="ft__info-label">Dirección</div>
                  <div className="ft__info-text">Av. Libertador Bernardo O'Higgins 611, Rancagua</div>
                </div>
              </li>
              <li className="ft__info-item">
                <span className="ft__info-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3Z"/></svg>
                </span>
                <div className="ft__info-body">
                  <div className="ft__info-label">Horario de Atención</div>
                  <div className="ft__info-text">08:30 – 16:30 hrs</div>
                </div>
              </li>
              <li className="ft__info-item">
                <span className="ft__info-ico" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4A2 2 0 0 0 2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/></svg>
                </span>
                <div className="ft__info-body">
                  <div className="ft__info-label">Correo de Atención</div>
                  <div className="ft__info-text">seq@uoh.cl</div>
                </div>
              </li>
            </ul>
          </section>

          {/* Columna derecha: Formulario de contacto */}
          <section className="ft__col ft__contact" aria-label="Contáctanos">
            <h4 className="ft__title">Contáctanos</h4>
            <p className="ft__muted">¿Tienes alguna duda? Escríbenos.</p>
            <form className="ft__contact-form" onSubmit={onSubmit} noValidate>
              <div className="ft__row">
                <input type="text" name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre*" aria-label="Nombre" required />
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email*" aria-label="Email" required />
              </div>

              <textarea name="mensaje" rows="4" value={form.mensaje} onChange={onChange} placeholder="Tu mensaje...*" aria-label="Mensaje" required />
              <button type="submit" className="ft__btn" disabled={sending}>{sending ? 'Enviando...' : 'Enviar'}</button>
              <small className="ft__fine">Usaremos tu correo solo para responderte.</small>
              {feedback && (
                <div role="status" className={`ft__feedback ${feedback.type}`} style={{ marginTop: 8 }}>
                  {feedback.msg}
                </div>
              )}
            </form>
          </section>
        </div>
      </div>

      <div className="ft__divider" aria-hidden="true" />

      <div className="ft__middle">
        <div className="ft__brand">
          <img src="/cNormal.png" alt="GenomIA" className="ft__brand-logo" />
          <span>GenomIA.</span>
        </div>
        <div className="ft__social" aria-label="Social links">
          <a aria-label="Instagram" href="https://www.instagram.com/biocompu_uoh/" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m8.6 2H7.6A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4m.85 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/></svg>
          </a>
        </div>
      </div>

      <div className="ft__bottom">
        <ul className="ft__policies">
          <li>
            <a href="#" onClick={handleTermsClick} className="terms-link">Términos y Condiciones</a>
          </li>
          <li><a href="https://www.sequoh.cl/ " target="_blank" rel="noreferrer">Conoce SeqUOH</a></li>
        </ul>
        <div className="ft__copy">© {new Date().getFullYear()} GenomIA · All rights reserved</div>
      </div>

      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={handleCloseTermsModal}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h2>Términos y Condiciones de Genomia</h2>
              <button className="terms-modal-close" onClick={handleCloseTermsModal} aria-label="Cerrar">×</button>
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
              <p>El análisis genético es una decisión personal importante. Antes de utilizar nuestros servicios, usted debe otorgar su consentimiento informado.</p>
              <h3>5. Privacidad y Protección de Datos</h3>
              <p>En Genomia, nos tomamos muy en serio su privacidad. Nuestra política de privacidad se rige por la legislación chilena aplicable.</p>
              <h3>6. Cuenta de Usuario y Seguridad</h3>
              <p>Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran en su cuenta.</p>
              <h3>7. Propiedad Intelectual</h3>
              <p>Todo el contenido de este sitio web es propiedad de Four Future S.A y está protegido por las leyes de propiedad intelectual.</p>
              <h3>8. Limitación de Responsabilidad</h3>
              <p>Genomia no será responsable por ninguna decisión o acción que usted tome basada en los resultados de su análisis de ascendencia.</p>
              <h3>9. Modificaciones a los Términos y Condiciones</h3>
              <p>Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento.</p>
              <h3>10. Ley Aplicable y Jurisdicción</h3>
              <p>Estos Términos y Condiciones se regirán por las leyes de la República de Chile.</p>
              <h3>11. Contacto</h3>
              <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos en: seq@uoh.cl.</p>
            </div>
            <div className="terms-modal-footer">
              <button className="terms-modal-accept" onClick={handleCloseTermsModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}


