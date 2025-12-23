"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Space } from "@/app/lib/types";
import { Warehouse, Sun, Trash2, Tent } from "lucide-react";

export default function SpaceCard({ space }: { space: Space }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${space.name}"?`)) return;
    setIsDeleting(true);
    try {
      await supabase.from('spaces').delete().eq('id', space.id);
      router.refresh();
    } catch (error) { alert("Error al eliminar"); setIsDeleting(false); }
  };

  if (isDeleting) return null;

  // Iconos dinámicos
  const getSpaceIcon = () => {
    switch(space.type) {
      case 'Indoor': return <Warehouse className="text-blue-400" size={24} />;
      case 'Outdoor': return <Sun className="text-amber-400" size={24} />;
      default: return <Tent className="text-purple-400" size={24} />;
    }
  };

  return (
    <div className="group bg-[#12141C] border border-white/5 rounded-3xl p-6 hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden">
        
        {/* Fondo decorativo */}
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
             <button onClick={handleDelete} className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20">
                <Trash2 size={16} />
             </button>
        </div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0C10] border border-white/5 flex items-center justify-center shrink-0">
             {getSpaceIcon()}
          </div>
          <div>
            <h3 className="text-xl font-light font-title text-white">{space.name}</h3>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-white/5 px-2 py-0.5 rounded-md">
                {space.type}
            </span>
          </div>
        </div>
        
        {/* Barra decorativa */}
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-body">Estado: Activo</span>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
            </div>
        </div>
    </div>
  );
}