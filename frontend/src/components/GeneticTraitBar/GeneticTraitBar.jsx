import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './GeneticTraitBar.css';

const GeneticTraitBar = ({ 
  title, 
  rsid, 
  genotype, 
  percentage, 
  impactLabel, 
  impactColor, 
  details = {},
  explanation,
  delay = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Determine intensity level based on percentage or simple heuristic for dots
  // Assuming percentage 0-100.
  // Low: <33, Medium: 33-66, High: >66
  const intensityLevel = percentage >= 66 ? 3 : percentage >= 33 ? 2 : 1;

  const toggleCard = () => setIsExpanded(!isExpanded);

  return (
    <div className={`genetic-trait-bar ${isExpanded ? 'open' : ''}`}>
      {/* Header */}
      <div className="genetic-trait-bar__header" onClick={toggleCard}>
        <div className="genetic-trait-bar__title-row">
          <h3 className="genetic-trait-bar__title">
            {title}
          </h3>
          <div className="genetic-trait-bar__badges">
            <span className="genetic-trait-bar__badge-rsid">
              {rsid || 'N/A'}
            </span>
            {genotype && genotype !== 'N/A' && (
              <span className="genetic-trait-bar__badge-genotype">
                {genotype}
              </span>
            )}
          </div>
          <span
            className="genetic-trait-bar__impact"
            style={{ color: impactColor }}
          >
            {Math.round(percentage)}% ({impactLabel})
          </span>
        </div>

        {/* Progress Bar */}
        <div className="genetic-trait-bar__progress-bg">
          <div
            className="genetic-trait-bar__progress-fill"
            style={{
              width: animate ? `${percentage}%` : '0%',
              backgroundColor: impactColor,
            }}
          />
        </div>

        {/* Toggle Button */}
        <button className="genetic-trait-bar__toggle">
          <span>Ver más información</span>
          <ChevronDown
            size={16}
            className="genetic-trait-bar__toggle-icon"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="genetic-trait-bar__details">
          {/* Detail Grid */}
          <div className="genetic-trait-bar__section">
            <h4 className="genetic-trait-bar__section-title">DETALLE</h4>
            <div className="genetic-trait-bar__grid">
              <div className="genetic-trait-bar__grid-item">
                <span className="genetic-trait-bar__label">RS ID</span>
                <span className="genetic-trait-bar__value">{rsid || 'N/A'}</span>
              </div>
              <div className="genetic-trait-bar__grid-item">
                <span className="genetic-trait-bar__label">Genotipo</span>
                <span className="genetic-trait-bar__value">{genotype || 'NA'}</span>
              </div>
              <div className="genetic-trait-bar__grid-item">
                <span className="genetic-trait-bar__label">Impacto</span>
                <span className="genetic-trait-bar__value" style={{ color: impactColor }}>{impactLabel}</span>
              </div>
              <div className="genetic-trait-bar__grid-item">
                <span className="genetic-trait-bar__label">Cromosoma / Posición</span>
                <span className="genetic-trait-bar__value">
                  {details.cromosoma || 'NA'} {details.posicion ? `/ ${details.posicion}` : ''}
                </span>
              </div>
              <div className="genetic-trait-bar__grid-item">
                <span className="genetic-trait-bar__label">Categoría</span>
                <span className="genetic-trait-bar__value">{details.categoria || 'Sin categoría'}</span>
              </div>
              <div className="genetic-trait-bar__grid-item">
                <span className="genetic-trait-bar__label">Magnitud</span>
                <span className="genetic-trait-bar__value">
                  {details.magnitud !== null && details.magnitud !== undefined ? details.magnitud : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="genetic-trait-bar__section">
            <h4 className="genetic-trait-bar__section-title">INTERPRETACIÓN</h4>
            <div className="genetic-trait-bar__interpretation">
              <span className="genetic-trait-bar__label">Intensidad estimada</span>
              <div className="genetic-trait-bar__intensity-dots">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className="genetic-trait-bar__dot"
                    style={{
                      background: intensityLevel >= level ? impactColor : '#e2e8f0',
                      boxShadow: intensityLevel >= level ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Explanation */}
          {explanation && (
            <div>
              <h4 className="genetic-trait-bar__section-title">EXPLICACIÓN</h4>
              <p className="genetic-trait-bar__description">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneticTraitBar;
