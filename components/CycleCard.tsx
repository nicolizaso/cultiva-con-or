"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link

 from "next/link";

interface CycleWithSpace {
  id: number;
  name: string;
  start_date: string;
  is_active: boolean;
  spaces: { name: string } | null;
}

export default function CycleCard({ cycle }: { cycle: CycleWithSpace }) { 
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    }

 catch (e) { alert("Error al eliminar"); }
  };

  // Determinar ícono según el estado
  const getStatusIcon = () => {
    if (cycle.is_active) {
      return "🌱";
    } else {
      return "📦";
    }
  };

  return (
    <div 
      className={`bg-brand-card border rounded-2xl overflow-hidden relative transition-all duration-300 ease-in-out ${
        cycle.is_active 
          ? 'border-brand-primary/30 hover:border-brand-primary' 
          : 'border-[#333] opacity-80 hover:opacity-100'
      }`}
      style={{
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Efecto de gradiente animado */}
      {cycle.is_active && (
        <div className={`absolute inset-0 bg-linear-to-r from-brand-primary/5 to-transparent opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''} pointer-events-none`}></div>
      )}
      
      {/* Zona cliqueable (Título e Info) */}
      <Link

 href={`/cycles/${cycle.id}`} className="block p-5 pb-3 group cursor-pointer relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-subtitle text-white group-hover:text-brand-primary transition-colors duration-300">
            {cycle.name}
          </h3>
          <div className="flex items-center gap-2">
            {cycle.is_active ? (
              <span className="text-[10px] font-bold bg-brand-primary text-brand-bg px-3 py-1 rounded-full uppercase">
                {getStatusIcon()} Activo
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-[#333] text-gray-400 px-3 py-1 rounded-full uppercase">
                {getStatusIcon()} Archivado
              </span>
            )}
          </div>
        </div>
        
        {/* Info adicional */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-brand-muted flex items-center gap-2 group-hover:text-gray-30

0 transition-colors">
            <span className="text-brand-primary">📍</span> 
            {cycle.spaces?.name || "Sin espacio"}
          </p>
          <p className="text-sm text-brand-muted group-hover:text-gray-300 transition-colors">
            <span className="text-brand-primary">📅</span> Inicio: {new Date(cycle.start_date).toLocaleDateString()}
          </p>
        </div>
        
        {/* Indicador de entrada con animación */}
        <div 
          className={`text-sm font-bold text-brand-primary flex items-center gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          <span>Ver detalles</span>
          <span className={isHovered ? 'translate-x-1' : ''}>→</span>
        </div>
      </Link>

      {/* Zona de botones */}
      <div className="flex gap-3 px-5 pb-5">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleStatus(); }}
          disabled={loading}


          className={`flex-1 text-sm font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            cycle.is_active 
              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30' 
              : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30'
          } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🌀</span> Procesando...
            </span>
          ) : cycle.is_active ? (
            "⏹ Finalizar"
          ) : (
            "▶ Reactivar"
          )}
        </button>
        
        <button 
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="px-4 text-sm font-bold py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/30 flex

 items-center justify-center hover:scale-105 duration-200"
          title="Borrar definitivamente"
        >
          🗑
        </button>
      </div>
    </div>
  );
}