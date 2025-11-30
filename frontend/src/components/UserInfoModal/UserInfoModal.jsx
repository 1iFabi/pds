import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import './UserInfoModal.css';

const UserInfoModal = ({ user, onClose, onPrint }) => {
  const [rutChecked, setRutChecked] = useState(false);
  const [nameChecked, setNameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const allChecked = rutChecked && nameChecked && emailChecked;

  useEffect(() => {
    setRutChecked(false);
    setNameChecked(false);
    setEmailChecked(false);
  }, [user]);

  const handlePrint = () => {
    if (allChecked) {
      onPrint();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Verificar Información del Usuario</h2>
          <button onClick={onClose} className="modal__close">
            <X size={24} />
          </button>
        </div>
        <div className="modal__content">
          <div className="verification-item">
            <input
              type="checkbox"
              id="rut-check"
              checked={rutChecked}
              onChange={() => setRutChecked(!rutChecked)}
            />
            <label htmlFor="rut-check">
              <strong>RUT:</strong> {user.rut}
            </label>
          </div>
          <div className="verification-item">
            <input
              type="checkbox"
              id="name-check"
              checked={nameChecked}
              onChange={() => setNameChecked(!nameChecked)}
            />
            <label htmlFor="name-check">
              <strong>Nombre:</strong> {`${user.first_name || ''} ${user.last_name || ''}`.trim()}
            </label>
          </div>
          <div className="verification-item">
            <input
              type="checkbox"
              id="email-check"
              checked={emailChecked}
              onChange={() => setEmailChecked(!emailChecked)}
            />
            <label htmlFor="email-check">
              <strong>Correo:</strong> {user.email}
            </label>
          </div>
        </div>
        <div className="modal__footer">
          <button
            className="reception-button reception-button--primary"
            disabled={!allChecked}
            onClick={handlePrint}
          >
            <Printer size={16} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
