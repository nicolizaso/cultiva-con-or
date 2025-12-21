"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <--- 1. Importamos Link
import { Cycle } from "@/app/lib/types";

// Extendemos el tipo Cycle para incluir el nombre del espacio
interface CycleWithSpace extends Cycle {
  spaces: { name: string } | null;
}

export default function CycleCard({ cycle }: { cycle: any }) { 
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
        ? 'bg-brand-card border-brand-primary/50 shadow-[0_0_10px_rgba(0,165,153,0.1)] hover:border-brand-primary' 
        : 'bg-[#1a1a1a] border-[#333] opacity-70 grayscale hover:opacity-100 hover:grayscale-0'
    }`}>
      
      {/* 2. ZONA CLIQUEABLE (Título e Info) */}
      <Link href={`/cycles/${cycle.id}`} className="block mb-4 group cursor-pointer">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-subtitle text-white group-hover:text-brand-primary group-hover:underline transition-colors decoration-dashed underline-offset-4">
                {cycle.name}
            </h3>
            {cycle.is_active ? (
                <span className="text-[10px] font-bold bg-brand-primary text-brand-bg px-2 py-0.5 rounded uppercase">Activo</span>
            ) : (
                <span className="text-[10px] font-bold bg-[#333] text-gray-400 px-2 py-0.5 rounded uppercase">Archivado</span>
            )}
        </div>
        
        {/* Info adicional */}
        <p className="text-xs text-brand-muted mt-1 flex items-center gap-1 group-hover:text-gray-300 transition-colors">
            📍 {cycle.spaces?.name || "Sin espacio"}
        </p>
        <p className="text-xs text-brand-muted group-hover:text-gray-300 transition-colors">
            🗓️ Inicio: {new Date(cycle.start_date).toLocaleDateString()}
        </p>
        
        <div className="mt-3 text-xs font-bold text-brand-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            ENTRAR AL PANEL ➜
        </div>
      </Link>

      {/* 3. ZONA DE BOTONES (Fuera del Link para evitar conflictos) */}
      <div className="flex gap-2 mt-auto border-t border-white/5 pt-4">
        <button 
            onClick={(e) => { e.stopPropagation(); toggleStatus(); }}
            disabled={loading}
            className="flex-1 text-xs font-bold py-2 rounded bg-white/5 hover:bg-white/10 text-white transition-colors uppercase"
        >
            {cycle.is_active ? "⏹️ Finalizar" : "▶️ Reactivar"}
        </button>
        
        <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="px-3 text-xs font-bold py-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
            title="Borrar definitivamente"
        >
            🗑️
        </button>
      </div>
    </div>
  );
}