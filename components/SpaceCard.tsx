"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Space } from "@/app/lib/types";

export default function SpaceCard({ space }: { space: Space }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

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

  // Determinar ícono y color según el tipo de espacio
  const getSpaceTypeInfo = () => {
    switch(space.type) {
      case 'Indoor':
        return { icon: '🏠', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/30' };
      case 'Outdoor':
        return { icon: '☀️', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400', borderColor: 'border-amber-500/30' };
      default:
        return { icon: '🔄', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30' };
    }
  };

  const spaceType = getSpaceTypeInfo();

  return (
    <div 
      className="bg-brand-card border border-[#333] rounded-2xl overflow-hidden transition-all duration-300 ease-in-out hover:border-brand-primary/50"
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
      }}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${spaceType.bgColor} ${spaceType.borderColor} border`}>
              <span className="text-2xl">{spaceType.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-subtitle text-white">{space.name}</h3>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mt-1 ${spaceType.bgColor} ${spaceType.textColor} ${spaceType.borderColor} border`}>
                {space.type}
              </span>
            </div>
          </div>
          
          {/* Botón de eliminar con animación */}
          <button 
            onClick={handleDelete}
            className={`text-brand-muted hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center ${
              showDeleteButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            title="Eliminar Espacio"
          >
            <span className="text-lg">🗑</span>
          </button>
        </div>
        
        {/* Barra de progreso indicativa */}
        <div className="mt-4 pt-4 border-t border-[#333]">
          <div className="flex justify-between text-xs text-brand-muted mb-1">
            <span>Estado</span>
            <span>Activo</span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2">
            <div 
              className="bg-brand-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}