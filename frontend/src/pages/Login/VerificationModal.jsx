import React, { useMemo } from 'react';

const VerificationModal = ({ isOpen, onClose, message, title = 'Verificación de cuenta' }) => {
  if (!isOpen) return null;

  const cleanMessage = useMemo(() => {
    if (!message) return 'Tu cuenta fue verificada correctamente.';
    let m = message;
    try { m = decodeURIComponent(m); } catch {}
    if ((m.startsWith('"') && m.endsWith('"')) || (m.startsWith("'") && m.endsWith("'"))) {
      m = m.slice(1, -1);
    }
    return m;
  }, [message]);

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <p className="modal-description" style={{ textAlign: 'center' }}>
            {cleanMessage}
          </p>

          <button 
            className="modal-submit-btn" 
            onClick={onClose}
            style={{ display: 'block', margin: '0 auto' }}
          >
            Entendido
          </button>
        </div>
      </div>

      <style>{`
        .forgot-password-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
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
        .modal-close-btn:hover { background: #f3f4f6; color: #374151; }
        .modal-content { padding: 0 24px 24px; }
        .modal-description { color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0; }
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
        .modal-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4); }
        @media (max-width: 480px) {
          .forgot-password-modal { margin: 0 10px; }
          .modal-header { padding: 20px 20px 0; }
          .modal-content { padding: 0 20px 20px; }
          .modal-title { font-size: 20px; }
        }
      `}</style>
    </div>
  );
};

export default VerificationModal;
