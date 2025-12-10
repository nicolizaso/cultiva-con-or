"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase"; // <--- 1. Importamos la conexión

interface PlantCardProps {
  id: number; // <--- 2. Agregamos el ID al contrato
  name: string;
  stage: string;
  days: number;
  lastWater: string;
}

export default function PlantCard({ id, name, stage, days, lastWater }: PlantCardProps) {
  // Inicializamos el estado con el valor que viene de la DB
  // Si lastWater es "Hoy", asumimos que está regada para la visualización
  const [isWatered, setIsWatered] = useState(lastWater === "Hoy");
  const [loading, setLoading] = useState(false); // Para evitar doble clic

  const handleWater = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 3. ENVIAMOS EL DATO A LA NUBE
      // "Actualiza la tabla 'plants', pon last_water = 'Hoy', donde el id sea este ID"
      const { error } = await supabase
        .from('plants')
        .update({ last_water: 'Hoy' }) 
        .eq('id', id);

      if (error) throw error;

      // Si todo salió bien en la nube, actualizamos la pantalla
      setIsWatered(true);
      alert("¡Riego guardado en la nube! ☁️💧"); // Feedback temporal
      
    } catch (error) {
      console.error("Error al regar:", error);
      alert("Hubo un error al guardar el riego");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden border w-full max-w-sm transition-all duration-300 ${
        isWatered ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 bg-slate-800'
    }`}>
      
      <div className="h-48 w-full bg-slate-700 relative">
        <div className="flex items-center justify-center h-full text-slate-500 text-4xl">
            {isWatered ? '💧' : '🌿'} 
        </div>
      </div>

      <div className="p-4 bg-slate-800">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-100">{name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                stage === 'Floración' 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
                {stage}
            </span>
        </div>

        <div className="text-sm text-slate-400 space-y-1">
            <p>🗓️ Día {days}</p>
            {/* Mostramos estado local mientras no refresquemos */}
            <p>💧 Riego: {isWatered ? 'Hoy' : lastWater}</p>
        </div>

        <button 
            onClick={handleWater}
            disabled={isWatered || loading}
            className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-all flex justify-center items-center ${
                isWatered 
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200'
            }`}
        >
            {loading ? 'Guardando...' : (isWatered ? '✅ Listo por hoy' : 'Regar ahora 💧')}
        </button>
      </div>
    </div>
  );
}