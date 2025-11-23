import { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";
import { cn } from "../lib/utils";

const levelConfig = {
  high: {
    buttonClass: "btn-priority-high text-white",
    accentColor: "text-red-600",
    badgeBg: "bg-red-100",
  },
  medium: {
    buttonClass: "btn-priority-medium text-white",
    accentColor: "text-yellow-600",
    badgeBg: "bg-yellow-100",
  },
  low: {
    buttonClass: "btn-priority-low text-white",
    accentColor: "text-blue-600",
    badgeBg: "bg-blue-100",
  },
};

const DiseaseCard = ({ disease, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = levelConfig[level];
  
  // Parse magnitud_efecto if available
  const magnitude = disease.magnitud_efecto ? parseFloat(disease.magnitud_efecto).toFixed(2) : 'N/A';
  const isHighRisk = magnitude !== 'N/A' && parseFloat(magnitude) >= 3.0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {disease.title}
          </h3>
          <p className="text-xs text-gray-600 font-medium">
            {disease.rsId || 'N/A'}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-2",
            config.accentColor,
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          {/* Información General */}
          <div className="space-y-3">
            <div className="pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identificación Genética</p>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">RS ID:</span>
                  <span className="text-sm font-mono text-gray-900 font-semibold">{disease.rsId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Cromosoma:</span>
                  <span className={cn("text-sm font-mono text-gray-900 font-semibold", disease.cromosoma === 'N/A' && 'text-gray-400')}>{disease.cromosoma || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Posición:</span>
                  <span className={cn("text-sm font-mono text-gray-900 font-semibold", disease.posicion === 'N/A' && 'text-gray-400')}>{disease.posicion || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Genotipo:</span>
                  <span className={cn("text-sm font-mono text-gray-900 font-semibold bg-gray-100 px-2 py-1 rounded", disease.genotype === 'N/A' && 'text-gray-400')}>{disease.genotype || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Magnitud de Efecto */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Análisis de Riesgo</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Magnitud de Efecto</p>
                  <p className="text-2xl font-bold text-gray-900">{magnitude}</p>
                </div>
                {isHighRisk && (
                  <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", config.badgeBg)}>
                    <Zap className={cn("w-4 h-4", config.accentColor)} />
                    <span className={cn("text-xs font-semibold", config.accentColor)}>Alto Impacto</span>
                  </div>
                )}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", 
                    magnitude !== 'N/A' && magnitude >= 4 ? 'bg-red-500' :
                    magnitude !== 'N/A' && magnitude >= 3 ? 'bg-yellow-500' :
                    magnitude !== 'N/A' && magnitude >= 2 ? 'bg-blue-500' : 'bg-green-500'
                  )}
                  style={{ width: magnitude !== 'N/A' ? `${Math.min(1, parseFloat(magnitude) / 5) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Ancestría */}
            {disease.ancestria_pais && disease.ancestria_pais !== 'N/A' && (
              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ancestría</p>
                <p className="text-xs text-gray-700 bg-amber-50 px-2 py-1 rounded">
                  Más predominante en: <span className="font-semibold text-gray-900">{disease.ancestria_pais}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseCard;
