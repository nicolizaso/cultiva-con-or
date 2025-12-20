"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation"; // <--- 1. Importamos el Router
import LogModal from "./LogModal";
import Image from "next/image";
import Link from "next/link"; // <--- AGREGA ESTO



interface PlantCardProps {
  id: number;
  name: string;
  stage: string;
  days: number;
  lastWater: string;
  imageUrl?: string | null;
}

export default function PlantCard({ id, name, stage, days, lastWater, imageUrl }: PlantCardProps) {  const router = useRouter(); // <--- 2. Inicializamos el GPS
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
    <div className="bg-brand-card border border-[#333] rounded-xl overflow-hidden group hover:border-brand-primary/50 transition-colors relative">
      
      {/* 1. BOTÓN DE BORRAR 
          IMPORTANTE: Está "suelto" (fuera de cualquier Link) y con z-20 para estar encima de todo.
          Así, si le das clic, borras la planta en lugar de entrar al detalle.
      */}
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        title="Eliminar Planta"
      >
        🗑️
      </button>

      {/* 2. ZONA DE IMAGEN (Envuelto en LINK) 
          Si tocas la foto, vas al detalle.
      */}
      <Link href={`/plants/${id}`} className="block h-48 w-full bg-[#1a1a1a] relative overflow-hidden">
        {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
        ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-4xl">
                {isWatered ? '💧' : '🌿'} 
            </div>
        )}
        
        {/* Gradiente sutil */}
        <div className="absolute inset-0 bg-linear-to-t from-brand-card via-transparent to-transparent opacity-60"></div>
      </Link>

      {/* 3. ZONA DE TEXTO */}
      <div className="p-4 bg-brand-card relative">
        <div className="flex justify-between items-start mb-2">
            
            {/* Título (Envuelto en LINK) 
                Si tocas el nombre, también vas al detalle.
            */}
            <div className="flex flex-col">
              <Link href={`/plants/${id}`} className="hover:text-brand-primary transition-colors">
                <h3 className="text-xl font-subtitle text-white">{name}</h3>
              </Link>
              
              <span className={`text-xs font-bold px-2 py-0.5 rounded w-fit mt-1 ${
                stage === 'Floración' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                stage === 'Vegetación' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                stage === 'Plántula' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {stage}
              </span>
            </div>
            
            {/* Modal de Log (Cámara) */}
            <LogModal plantId={id} plantName={name} />
        </div>
        
        <div className="flex justify-between items-end mt-4 text-sm text-brand-muted font-body border-t border-[#333] pt-3">
            <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Edad</p>
                <p className="text-white font-bold">{days} días</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-gray-500">Riego</p>
                <p className={isWatered ? "text-brand-primary font-bold" : "text-white"}>
                    {lastWater}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}