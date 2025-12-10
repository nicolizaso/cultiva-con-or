"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation"; // <--- 1. Importamos el Router

interface PlantCardProps {
  id: number;
  name: string;
  stage: string;
  days: number;
  lastWater: string;
}

export default function PlantCard({ id, name, stage, days, lastWater }: PlantCardProps) {
  const router = useRouter(); // <--- 2. Inicializamos el GPS
  const [isWatered, setIsWatered] = useState(lastWater === "Hoy");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Estado para el borrado

  // Lógica de Riego (Ya la tenías)
  const handleWater = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('plants')
        .update({ last_water: 'Hoy' }) 
        .eq('id', id);
      if (error) throw error;
      setIsWatered(true);
    } catch (error) {
      console.error("Error al regar:", error);
      alert("Hubo un error al guardar el riego");
    } finally {
      setLoading(false);
    }
  };

  // 3. NUEVA LÓGICA: Borrar Planta
  const handleDelete = async () => {
    // Confirmación simple del navegador
    const confirm = window.confirm(`¿Seguro que quieres eliminar a ${name}? Esta acción no se puede deshacer.`);
    
    if (!confirm) return;

    setIsDeleting(true);
    try {
      // Borramos de Supabase
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refrescamos la página para que desaparezca la tarjeta
      router.refresh(); 

    } catch (error) {
      alert("Error al eliminar");
      setIsDeleting(false);
    }
  };

  // Si se está borrando, ocultamos la tarjeta visualmente para dar feedback rápido
  if (isDeleting) {
    return null; 
  }

  return (
    <div className={`relative group rounded-xl overflow-hidden border w-full max-w-sm transition-all duration-300 ${
        isWatered ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 bg-slate-800'
    }`}>
      
      {/* 4. BOTÓN DE BORRAR (Solo visible al pasar el mouse - group-hover) */}
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 bg-slate-900/80 hover:bg-red-500 text-slate-400 hover:text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        title="Eliminar planta"
      >
        🗑️
      </button>

      {/* Imagen */}
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