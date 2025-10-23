import { Activity } from "lucide-react";
import PriorityCard from "./PriorityCard/PriorityCard";
import { priorityData } from "@/lib/geneticData";

const GeneticDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <Activity className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Panel de Diagnóstico Genético
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Análisis de riesgos genéticos organizados por nivel de prioridad
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {priorityData.map((priority) => (
          <PriorityCard
            key={priority.level}
            level={priority.level}
            title={priority.title}
            diseases={priority.diseases}
          />
        ))}
      </div>
    </div>
  );
};

export default GeneticDashboard;
