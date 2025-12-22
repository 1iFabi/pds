import React, { useEffect, useState } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import './DrugBar.css';

function DrugBar({ drug, delay = 0, systemColor, impactDisplayColor }) {
  const { name, percentage } = drug || {};
  const [animate, setAnimate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getPercentageLabel = (pct) => {
    if (pct >= 61) return 'Alto';
    if (pct >= 31) return 'Medio';
    return 'Bajo';
  };
  const percentageLabel = getPercentageLabel(percentage);

  const rsId = drug.rsid || 'N/A';
  const cromosoma = drug.cromosoma || 'N/A';
  const posicion = drug.posicion || 'N/A';
  const genotipo = drug.genotipo || 'N/A';
  const magnitudeRaw = drug.magnitud;
  const magnitudeVal = parseFloat(magnitudeRaw);
  const magnitude = Number.isFinite(magnitudeVal) ? magnitudeVal.toFixed(1) : 'N/A';
  const magnitudePercent = Number.isFinite(magnitudeVal) ? Math.min(100, Math.max(0, (magnitudeVal / 5) * 100)) : 0;
  const isHighRisk = Number.isFinite(magnitudeVal) && magnitudeVal >= 3;

  return (
    <div className={`drug-bar ${isExpanded ? 'drug-bar--open' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className="text-sm font-semibold" style={{ color: systemColor }}>
          {percentage}% ({percentageLabel})
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: animate ? `${percentage}%` : '0%', backgroundColor: systemColor }}
        />
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 w-full flex justify-between items-center text-xs text-gray-500 hover:text-gray-700 transition-all duration-200"
      >
        <span>Ver mas información</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="drug-bar__details">
          <div className="drug-bar__details-inner text-sm text-gray-700">
            <div className="pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identificacion Genetica</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">RS ID:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{rsId}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Cromosoma:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{cromosoma}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Posicion:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{posicion}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Genotipo:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold bg-gray-100 px-2 py-1 rounded">{genotipo}</span>
                </div>
              </div>
            </div>

            <div className="pb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Analisis de Riesgo</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Magnitud de Efecto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {magnitude} <span className="text-sm text-gray-500 font-normal">/5.0</span>
                  </p>
                </div>
                {isHighRisk && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${impactDisplayColor}20` }}>
                    <Zap className="w-4 h-4" style={{ color: impactDisplayColor }} />
                    <span className="text-xs font-semibold" style={{ color: impactDisplayColor }}>Alto Impacto</span>
                  </div>
                )}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${magnitudePercent}%`,
                    backgroundColor: impactDisplayColor
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrugBar;
