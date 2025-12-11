"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Cycle } from "@/app/lib/types";

// Extendemos el tipo Cycle para incluir el nombre del espacio (que viene del JOIN)
interface CycleWithSpace extends Cycle {
  spaces: { name: string } | null; // Supabase devuelve un objeto anidado
}

export default function CycleCard({ cycle }: { cycle: any }) { // Usamos any temporalmente para evitar líos con el JOIN type
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Toggle Activo/Archivado
  const toggleStatus = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cycles')
        .update({ is_active: !cycle.is_active })
        .eq('id', cycle.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      alert("Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este ciclo y todo su historial? ⚠️ Es mejor archivarlo.")) return;
    
    try {
      await supabase.from('cycles').delete().eq('id', cycle.id);
      router.refresh();
    } catch (e) { alert("Error al eliminar"); }
  };

  return (
    <div className={`border p-5 rounded-xl flex flex-col justify-between transition-all ${
        cycle.is_active 
        ? 'bg-brand-card border-brand-primary/50 shadow-[0_0_10px_rgba(0,165,153,0.1)]' 
        : 'bg-[#1a1a1a] border-[#333] opacity-70 grayscale'
    }`}>
      
      <div className="mb-4">
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-subtitle text-white">{cycle.name}</h3>
            {cycle.is_active ? (
                <span className="text-[10px] font-bold bg-brand-primary text-brand-bg px-2 py-0.5 rounded uppercase">Activo</span>
            ) : (
                <span className="text-[10px] font-bold bg-[#333] text-gray-400 px-2 py-0.5 rounded uppercase">Archivado</span>
            )}
        </div>
        
        {/* Mostramos el nombre del espacio si existe */}
        <p className="text-xs text-brand-muted mt-1 flex items-center gap-1">
            📍 {cycle.spaces?.name || "Sin espacio"}
        </p>
        <p className="text-xs text-brand-muted">
            🗓️ Inicio: {new Date(cycle.start_date).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2 mt-auto border-t border-white/5 pt-4">
        <button 
            onClick={toggleStatus}
            disabled={loading}
            className="flex-1 text-xs font-bold py-2 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
            {cycle.is_active ? "⏹️ FINALIZAR" : "▶️ REACTIVAR"}
        </button>
        
        <button 
            onClick={handleDelete}
            className="px-3 text-xs font-bold py-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
            title="Borrar definitivamente"
        >
            🗑️
        </button>
      </div>
    </div>
  );
}