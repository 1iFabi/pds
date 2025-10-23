import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

const levelConfig = {
  high: {
    buttonClass: "btn-priority-high text-white",
    accentColor: "text-red-600",
  },
  medium: {
    buttonClass: "btn-priority-medium text-white",
    accentColor: "text-yellow-600",
  },
  low: {
    buttonClass: "btn-priority-low text-white",
    accentColor: "text-blue-600",
  },
};

const DiseaseCard = ({ disease, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = levelConfig[level];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <h3 className="text-base font-semibold text-gray-900">
          {disease.title}
        </h3>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform duration-300 flex-shrink-0",
            config.accentColor,
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-semibold text-gray-900 w-24">RS ID:</span>
              <span className="text-gray-700 font-mono">{disease.rsId}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-900 w-24">Genotipo:</span>
              <span className="text-gray-700 font-mono">{disease.genotype}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-gray-900 w-24">Descripción:</span>
              <span className="text-gray-700 leading-relaxed">{disease.description}</span>
            </div>
          </div>

          <button
            className={cn("w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 mt-2 btn-ver-recomendaciones", config.buttonClass)}
          >
            Ver Recomendaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default DiseaseCard;
