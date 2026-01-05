import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Activity, TrendingUp, Globe } from 'lucide-react';
import './DiseaseCard.css';

const DiseaseCard = ({ disease, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize level to css class suffix
  const riskClassMap = {
    high: 'risk-high',
    medium: 'risk-medium',
    low: 'risk-low'
  };
  const riskClass = riskClassMap[level] || 'risk-low';
  
  const riskLabelMap = {
    high: 'ALTO',
    medium: 'MEDIO',
    low: 'BAJO'
  };
  const riskLabel = riskLabelMap[level] || 'BAJO';

  // Magnitude 0-5
  const magnitude = disease.magnitud_efecto ? parseFloat(disease.magnitud_efecto) : 0;
  const roundedMagnitude = Math.round(magnitude);
  const formatFrequency = (value) => {
    if (value === null || value === undefined || value === '') return 'N/D';
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 'N/D';
    const percent = parsed <= 1 ? parsed * 100 : parsed;
    return `${percent.toFixed(2)}%`;
  };

  return (
    <div className={`disease-card ${riskClass}`}>
      <div className="dc-content">
        {/* Header */}
        <div className="dc-header">
          <div className="dc-info">
            <h2 className="dc-title">{disease.title}</h2>
          </div>
          <div className={`dc-badge ${riskClass}`}>
            TU RIESGO: {riskLabel}
          </div>
        </div>

        {/* Phenotype / Info Box */}
        <div className="dc-phenotype-box">
          <p className="dc-phenotype-text">
            <Activity size={20} className="dc-icon-activity" />
            {disease.genotype ? `Genotipo: ${disease.genotype}` : 'Genotipo no disponible'}
          </p>
        </div>

        {/* Gauge Visual */}
        <div className="dc-gauge-container">
          <div className="dc-gauge-labels">
            <span>Bajo</span>
            <span>Medio</span>
            <span>Alto</span>
          </div>
          <div className="dc-gauge-bar">
            <div className="dc-gauge-indicator"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dc-stats-grid">
          <div className="dc-stat-box">
            <div className="dc-stat-header">
              <TrendingUp size={16} className="text-gray-400" />
              <span className="dc-stat-label">MAGNITUD</span>
            </div>
            <div className="dc-magnitude-bars">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`dc-magnitude-bar ${i < roundedMagnitude ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="dc-stat-box">
            <div className="dc-stat-header">
              <Globe size={16} className="text-gray-400" />
              <span className="dc-stat-label">FRECUENCIA CHILE</span>
            </div>
            <span className="dc-stat-value">{formatFrequency(disease.freq_chile_percent)}</span>
            <span className="dc-stat-note">Frecuencia estimada para este genotipo.</span>
          </div>
          
          {disease.ancestria_pais && (
             <div className="dc-stat-box">
               <div className="dc-stat-header">
                 <Globe size={16} className="text-gray-400" />
                 <span className="dc-stat-label">ANCESTRÍA</span>
               </div>
               <span className="dc-stat-value">{disease.ancestria_pais}</span>
             </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="dc-expand-btn"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={20} />
              Ocultar detalles
            </>
          ) : (
            <>
              <ChevronDown size={20} />
              Ver explicación
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="dc-expanded">
          <h4>Explicación</h4>
          <p className="dc-description">
            {disease.description || disease.phenotype_description || "No hay una descripción detallada disponible para esta variante."}
          </p>
        </div>
      )}
    </div>
  );
};

export default DiseaseCard;
