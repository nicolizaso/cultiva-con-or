"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation"; // <--- 1. Importamos el Router
import LogModal from "./LogModal";
import Image from "next/image";

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
    <div className={`relative group rounded-xl overflow-hidden border w-full max-w-sm transition-all duration-300 ${
        isWatered 
        ? 'border-brand-primary shadow-[0_0_15px_rgba(0,165,153,0.3)]' // Borde Turquesa si está regada
        : 'border-[#333333] bg-brand-card' // <--- Fondo Gris #292929
    }`}>
      
      {/* Botón Borrar */}
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        title="Eliminar planta"
      >
        🗑️
      </button>

      {/* 3. ZONA DE IMAGEN MODIFICADA */}
      <div className="h-64 w-full bg-[#1a1a1a] relative overflow-hidden"> 
        {imageUrl ? (
            // SI HAY FOTO REAL:
            <Image 
              src={imageUrl} 
              alt={name}
              fill
              // 1. ELIMINA EL ERROR AMARILLO:
              // Le decimos: "En celular ocupa el 100%, en tablet el 50%, en PC el 33%"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
              // 2. ESTILO VISUAL:
              // object-cover: Recorta para llenar (se ve lindo en grilla)
              // object-center: Intenta centrar la parte importante
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
        ) : (
            // SI NO HAY FOTO (Placeholder Original):
            <div className="flex items-center justify-center h-full text-gray-600 text-4xl">
                {isWatered ? '💧' : '🌿'} 
            </div>
        )}
        
        {/* Gradiente sutil para que el texto se lea mejor si la foto es clara */}
        <div className="absolute inset-0 bg-linear-to-t from-brand-card via-transparent to-transparent opacity-60"></div>
      </div>

      <div className="p-4 bg-brand-card"> {/* <--- Fondo Gris #292929 */}
        <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
            <h3 className="text-xl font-subtitle text-white">{name}</h3>
            <LogModal plantId={id} plantName={name} />
            <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                stage === 'Floración' 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' // <--- Turquesa
            }`}>
                {stage}
            </span>
        </div>
        </div>
        <div className="text-sm text-brand-muted space-y-1 font-body">
            <p>🗓️ Día {days}</p>
            <p>💧 Riego: {isWatered ? 'Hoy' : lastWater}</p>
        </div>

        <button 
            onClick={handleWater}
            disabled={isWatered || loading}
            className={`w-full mt-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all flex justify-center items-center font-title ${
                isWatered 
                ? 'bg-brand-primary text-brand-bg cursor-default' // Turquesa con texto oscuro
                : 'bg-brand-primary hover:bg-brand-primary-hover text-brand-bg' // <--- Turquesa oficial
            }`}
        >
            {loading ? 'GUARDANDO...' : (isWatered ? 'LISTO POR HOY' : 'REGAR AHORA')}
        </button>
      </div>
    </div>
  );
}