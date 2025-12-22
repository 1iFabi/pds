// BiomarkerStats.jsx
import './BiomarkerStats.css';

export default function BiomarkerStats() {
  return (
    <div className="stats-container">
      <div className="stats-title">📊 Resumen de Análisis</div>
      
      <div className="stat-item">
        <div className="stat-label">Variantes Analizadas</div>
        <div className="stat-value">127</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width: '100%'}}></div>
        </div>
      </div>
      
      <div className="divider"></div>
      
      <div className="stat-item level-2">
        <div className="stat-label">Total de Biomarcadores</div>
        <div className="stat-value">24</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width: '75%'}}></div>
        </div>
      </div>
      
      <div className="divider"></div>
      
      <div className="stat-item level-3">
        <div className="stat-label">Biomarcadores en tu perfil</div>
        <div className="stat-value">3</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width: '45%'}}></div>
        </div>
      </div>
    </div>
  );
}