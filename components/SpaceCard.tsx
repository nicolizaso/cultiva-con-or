"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Space } from "@/app/lib/types";

export default function SpaceCard({ space }: { space: Space }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm(
      `¿Eliminar "${space.name}"?\n\n⚠️ ADVERTENCIA: Si borras este espacio, los ciclos y plantas asociados podrían quedar desvinculados o perderse.`
    );
    
    if (!confirm) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', space.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      alert("Error al eliminar");
      setIsDeleting(false);
    }
  };

  if (isDeleting) return null;

  return (
    <div className="bg-brand-card border border-[#333] p-5 rounded-xl flex justify-between items-center group hover:border-brand-primary/50 transition-colors">
      <div>
        <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{space.type === 'Indoor' ? '🏠' : space.type === 'Outdoor' ? '☀️' : '🔄'}</span>
            <h3 className="text-lg font-subtitle text-white">{space.name}</h3>
        </div>
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider bg-[#1a1a1a] px-2 py-1 rounded">
            {space.type}
        </span>
      </div>

      <button 
        onClick={handleDelete}
        className="text-brand-muted hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
        title="Eliminar Espacio"
      >
        🗑️
      </button>
    </div>
  );
}