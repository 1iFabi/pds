import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const CONTACT_EMAIL = 'contacto@sequoh.cl';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent('Contacto desde GenomIA');
    const body = encodeURIComponent(`De: ${email}\n\n${msg}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="ft" id="contacto" role="contentinfo" aria-label="Contacto">
      <div className="ft-container">
        <div className="ft-col ft-brand">
          <img src="/cSolido.png" alt="GenomIA" className="ft-logo" />
          <p className="ft-blurb">
            GenomIA por SeqUOH — análisis genético claro, confiable y centrado en las personas.
          </p>
        </div>

        <nav className="ft-col ft-links" aria-label="Enlaces">
          <h4 className="ft-title">Navegación</h4>
          <ul>
            <li><Link to="/inicio">Inicio</Link></li>
            <li><Link to="/descubre">Descubre</Link></li>
            <li><Link to="/conoce">Conoce</Link></li>
            <li><Link to="/obten">Precio</Link></li>
            <li><Link to="/equipo">Equipo</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div className="ft-col ft-contact">
          <h4 className="ft-title">Contacto directo</h4>
          <form className="ft-form" onSubmit={onSubmit}>
            <input
              type="email"
              className="ft-input"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              className="ft-textarea"
              placeholder="Tu mensaje"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={3}
              required
            />
            <button className="ft-send" type="submit">Enviar</button>
          </form>
          <a className="ft-mailto" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
      <div className="ft-bottom">© {new Date().getFullYear()} GenomIA · Todos los derechos reservados.</div>
    </footer>
  );
}
