"use client";

import { useState, useEffect } from "react";
import { Plant } from "@/app/lib/types";
import AddCycleModal from "./AddCycleModal";
import Link from "next/link";

interface CycleWithPlants {
  id: number;
  name: string;
  start_date: string;
  space_id: number;
  plants: Plant[];
}

interface CycleStatusCardProps {
  cycles: CycleWithPlants[];
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  lastRecorded: string; // ISO date string
}

// Mapa de etapas con colores y duraciones estimadas (en días totales desde inicio)
const STAGE_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; estimatedDays: number }> = {
  "Germinación": { 
    color: "text-green-400", 
    bgColor: "bg-green-500/10", 
    borderColor: "border-green-500/20",
    estimatedDays: 7
  },
  "Esqueje": { 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/10", 
    borderColor: "border-blue-500/20",
    estimatedDays: 14
  },
  "Vegetación": { 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10", 
    borderColor: "border-emerald-500/20",
    estimatedDays: 60
  },
  "Floración": { 
    color: "text-purple-400", 
    bgColor: "bg-purple-500/10", 
    borderColor: "border-purple-500/20",
    estimatedDays: 130 // ~60 vege + ~70 flora
  },
  "Secado": { 
    color: "text-amber-700", 
    bgColor: "bg-amber-700/10", 
    borderColor: "border-amber-700/20",
    estimatedDays: 145 // +15 días de secado
  }
};

// Función para determinar la etapa del ciclo basada en las plantas
function getCycleStage(plants: Plant[]): string {
  if (!plants || plants.length === 0) return "Vegetación";
  
  // Orden de prioridad de etapas (más avanzadas primero)
  const stagePriority: Record<string, number> = {
    "Secado": 5,
    "Floración": 4,
    "Vegetación": 3,
    "Esqueje": 2,
    "Germinación": 1
  };

  // Contamos cuántas plantas hay en cada etapa
  const stageCount: Record<string, number> = {};
  plants.forEach(plant => {
    stageCount[plant.stage] = (stageCount[plant.stage] || 0) + 1;
  });

  // Retornamos la etapa más avanzada que tenga plantas
  const sortedStages = Object.keys(stageCount).sort((a, b) => 
    (stagePriority[b] || 0) - (stagePriority[a] || 0)
  );

  return sortedStages[0] || "Vegetación";
}

// Función para calcular semanas
function getWeeks(days: number): number {
  return Math.floor(days / 7);
}

// Función para calcular porcentaje de progreso
function getProgressPercentage(currentDays: number, stage: string): number {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG["Vegetación"];
  const maxDays = config.estimatedDays;
  const percentage = Math.min((currentDays / maxDays) * 100, 100);
  return Math.round(percentage);
}

export default function CycleStatusCard({ cycles }: CycleStatusCardProps) {
  const [tooltipCycleId, setTooltipCycleId] = useState<number | null>(null);
  const [showMeasurementModal, setShowMeasurementModal] = useState<number | null>(null);

  // Cerrar tooltip al hacer click fuera (útil para mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tooltip-container')) {
        setTooltipCycleId(null);
      }
    };

    if (tooltipCycleId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [tooltipCycleId]);
  
  // Por ahora usamos datos mockeados para parámetros ambientales
  // En el futuro esto vendrá de una tabla de mediciones
  const [environmentalData, setEnvironmentalData] = useState<Record<number, EnvironmentalData>>(() => {
    const initial: Record<number, EnvironmentalData> = {};
    cycles.forEach(cycle => {
      initial[cycle.id] = {
        temperature: 24,
        humidity: 60,
        lastRecorded: new Date().toISOString()
      };
    });
    return initial;
  });

  const handleAddMeasurement = async (cycleId: number, temp: number, humidity: number) => {
    // Por ahora solo actualizamos el estado local
    // En el futuro esto guardará en la base de datos
    setEnvironmentalData(prev => ({
      ...prev,
      [cycleId]: {
        temperature: temp,
        humidity: humidity,
        lastRecorded: new Date().toISOString()
      }
    }));
    setShowMeasurementModal(null);
  };

  return (
    <div className="bg-brand-card border border-[#333] rounded-xl overflow-hidden">
      {/* Header oscuro */}
      <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#333]">
        <h2 className="text-xl font-subtitle text-white">Estado de Ciclo</h2>
        <p className="text-sm text-brand-muted mt-1">¿En qué punto estamos?</p>
      </div>

      {/* Empty State - Onboarding */}
      {cycles.length === 0 ? (
        <div className="bg-[#222] p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🌱</span>
            </div>
            <h3 className="text-2xl font-subtitle text-white mb-2">¡Bienvenido!</h3>
            <p className="text-brand-muted mb-6 max-w-md mx-auto">
              Configura tu primer espacio de cultivo para empezar
            </p>
          </div>
          <div className="flex justify-center">
            <AddCycleModal />
          </div>
        </div>
      ) : (
        /* Contenedor de sub-tarjetas - siempre apiladas verticalmente */
        <div className={`flex flex-col ${cycles.length > 1 ? 'divide-y divide-[#333]' : ''}`}>
          {cycles.map((cycle) => {
          const daysDiff = Math.floor(
            (new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          const weeks = getWeeks(daysDiff);
          const stage = getCycleStage(cycle.plants);
          const stageConfig = STAGE_CONFIG[stage] || STAGE_CONFIG["Vegetación"];
          const progressPercentage = getProgressPercentage(daysDiff, stage);
          const envData = environmentalData[cycle.id] || { temperature: 24, humidity: 60, lastRecorded: new Date().toISOString() };

          return (
            <div
              key={cycle.id}
              className="bg-[#222] p-6 hover:bg-[#252525] transition-colors space-y-4"
            >
              {/* Header: Título y Badge en dos columnas */}
              <div className="flex flex-row items-center justify-between gap-4">
                {/* Columna Izquierda: Título */}
              <div className="flex-1 min-w-0">
                <Link href={`/cycles/${cycle.id}`} className="hover:text-brand-primary transition-colors">
                    <h3 className="text-lg font-subtitle text-white underline decoration-dashed underline-offset-4 decoration-gray-600 hover:decoration-brand-primary">
                      {cycle.name}
                    </h3>
                </Link>
              </div>

                {/* Columna Derecha: Badge de Estado */}
                <div className="flex justify-end shrink-0">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${stageConfig.bgColor} ${stageConfig.color} ${stageConfig.borderColor}`}
                  >
                    {stage}
                  </span>
                </div>
              </div>

              {/* Contenido: Día/Semana y Parámetros Ambientales */}
              <div className="flex flex-row items-center justify-between gap-4">
                {/* Columna Izquierda: Día y Semana */}
                <div className="flex-1 min-w-0">
                  <div className="text-4xl font-title text-white mb-1">Día {daysDiff}</div>
                  <div className="text-sm text-brand-muted">Semana {weeks}</div>
                </div>

                {/* Columna Derecha: Parámetros Ambientales */}
                <div className="flex items-center gap-2 text-sm text-white shrink-0 relative tooltip-container">
                  <span>🌡️ {envData.temperature}°C</span>
                  <span className="text-brand-muted">|</span>
                  <span>💧 {envData.humidity}% HR</span>
                  <div className="relative">
                    <button
                      className="text-xs text-brand-muted hover:text-brand-primary transition-colors cursor-help"
                      onMouseEnter={() => setTooltipCycleId(cycle.id)}
                      onMouseLeave={() => setTooltipCycleId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTooltipCycleId(tooltipCycleId === cycle.id ? null : cycle.id);
                      }}
                    >
                      ℹ️
                    </button>
                    
                    {/* Tooltip */}
                    {tooltipCycleId === cycle.id && (
                      <div 
                        className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-lg z-50 min-w-[200px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs text-brand-muted mb-2">
                          Última medición: {new Date(envData.lastRecorded).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <button
                          onClick={() => {
                            setShowMeasurementModal(cycle.id);
                            setTooltipCycleId(null);
                          }}
                          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-bg text-xs font-bold py-2 px-3 rounded transition-colors"
                        >
                          Agregar Nueva Medición
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra de Progreso - Ancho completo */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-brand-primary whitespace-nowrap">{progressPercentage}%</span>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Modal para agregar medición */}
      {showMeasurementModal && (
        <MeasurementModal
          cycleId={showMeasurementModal}
          cycleName={cycles.find(c => c.id === showMeasurementModal)?.name || ""}
          onClose={() => setShowMeasurementModal(null)}
          onSave={handleAddMeasurement}
          currentData={environmentalData[showMeasurementModal]}
        />
      )}
    </div>
  );
}

// Componente Modal para agregar medición
interface MeasurementModalProps {
  cycleId: number;
  cycleName: string;
  onClose: () => void;
  onSave: (cycleId: number, temp: number, humidity: number) => void;
  currentData: EnvironmentalData;
}

function MeasurementModal({ cycleId, cycleName, onClose, onSave, currentData }: MeasurementModalProps) {
  const [temperature, setTemperature] = useState(currentData.temperature.toString());
  const [humidity, setHumidity] = useState(currentData.humidity.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSave(cycleId, parseFloat(temperature), parseFloat(humidity));
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-card border border-[#333] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-subtitle text-white mb-2">Nueva Medición Ambiental</h3>
        <p className="text-sm text-brand-muted mb-4">{cycleName}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">
                Humedad Relativa (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-brand-muted hover:text-white font-bold text-xs uppercase transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg py-3 rounded-lg font-title tracking-wide transition disabled:opacity-50"
            >
              {loading ? "GUARDANDO..." : "GUARDAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

