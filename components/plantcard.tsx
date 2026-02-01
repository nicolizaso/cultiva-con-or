"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import LogModal from "./LogModal";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface PlantCardProps {
  id: number;
  name: string;
  stage: string;
  days?: number;
  current_age_days?: number;
  planted_at?: string;
  lastWater: string;
  imageUrl?: string | null;
  cycleName?: string;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export default function PlantCard({
  id,
  name,
  stage,
  days,
  current_age_days,
  planted_at,
  lastWater,
  imageUrl,
  cycleName,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}: PlantCardProps) {
  const router = useRouter();
  const [isWatered, setIsWatered] = useState(lastWater === "Hoy");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  // Lógica de Riego
  const handleWater = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('plants')
        .update({ last_water: 'Hoy' }) 
        .eq('id', id);
      if (error) throw error;
      setIsWatered(true);
      
      // Resetear estado visual después de 2 segundos
      setTimeout(() => setIsWatered(false), 2000);
    } catch (error) {
      console.error("Error al regar:", error);
      alert("Hubo un error al guardar el riego");
    } finally {
      setLoading(false);
    }
  };

  // Borrar Planta
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const confirm = window.confirm(`¿Seguro que quieres eliminar a ${name}? Esta acción no se puede deshacer.`);
    
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.refresh(); 
    } catch (error) {
      alert("Error al eliminar");
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelection) {
        e.preventDefault();
        onToggleSelection();
    }
  };

  // Si se está borrando, ocultamos la tarjeta visualmente
  if (isDeleting) {
    return null; 
  }

  // Configuración de etapas con colores
  const stageConfig = {
    'Floración': { 
      bgColor: 'bg-purple-500/10', 
      textColor: 'text-purple-400', 
      borderColor: 'border-purple-500/30',
      icon: '🌸'
    },
    'Vegetativo': {
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/30',
      icon: '🌿'
    },
    'Vegetación': { 
      bgColor: 'bg-green-500/10', 
      textColor: 'text-green-400', 
      borderColor: 'border-green-500/30',
      icon: '🌿'
    },
    'Plántula': { 
      bgColor: 'bg-yellow-500/10', 
      textColor: 'text-yellow-400', 
      borderColor: 'border-yellow-500/30',
      icon: '🌱'
    },
    'Germinación': { 
      bgColor: 'bg-blue-500/10', 
      textColor: 'text-blue-400', 
      borderColor: 'border-blue-500/30',
      icon: '💧'
    },
    'Secado': { 
      bgColor: 'bg-amber-700/10', 
      textColor: 'text-amber-600', 
      borderColor: 'border-amber-700/30',
      icon: '🍂'
    },
    'Curado': {
      bgColor: 'bg-amber-900/10',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-900/30',
      icon: '🍯'
    },
    'Esqueje': { 
      bgColor: 'bg-emerald-500/10', 
      textColor: 'text-emerald-400', 
      borderColor: 'border-emerald-500/30',
      icon: '✂️'
    }
  };

  const stageInfo = stageConfig[stage as keyof typeof stageConfig] || stageConfig['Vegetación'];

  return (
    <motion.div 
      className={`card-enhanced group relative overflow-hidden cursor-pointer ${selectionMode && isSelected ? 'ring-2 ring-brand-primary' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={selectionMode ? {} : { y: -5 }}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
      onClick={handleCardClick}
    >
      {/* Selection Overlay */}
      {selectionMode && (
          <div className={`absolute inset-0 z-30 transition-colors ${isSelected ? 'bg-brand-primary/20' : 'bg-transparent hover:bg-white/5'}`}>
              {isSelected && (
                  <div className="absolute top-3 right-3 bg-brand-primary text-black rounded-full p-1 shadow-lg">
                      <Check size={16} strokeWidth={3} />
                  </div>
              )}
               {/* Always show a faint circle to indicate selectability if not selected */}
               {!isSelected && (
                   <div className="absolute top-3 right-3 w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-white/50"></div>
               )}
          </div>
      )}

      {/* Botón de eliminar con animación - Only if not in selection mode */}
      <AnimatePresence>
        {showDeleteButton && !selectionMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleDelete}
            className="absolute top-3 right-3 z-20 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-full backdrop-blur-sm border border-red-500/30 transition-all duration-300 flex items-center justify-center"
            title="Eliminar Planta"
          >
            <span className="text-lg">🗑</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Zona de imagen con efecto de zoom */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="block h-48 w-full relative">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
              className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-brand-card to-[#1a1a1a]">
              <motion.div 
                className="text-5xl"
                animate={{ 
                  scale: isWatered ? [1, 1.3, 1] : 1,
                  rotate: isWatered ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 0.5 }}
              >
                {isWatered ? '💧' : stageInfo.icon}
              </motion.div>
            </div>
          )}
          
          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-linear-to-t from-brand-card via-transparent to-transparent opacity-70"></div>
        </div>
      </div>

      {/* Zona de contenido */}
      <div className="p-5 bg-brand-card relative">
        <div className="flex justify-between items-start mb-4">
          {/* Información principal */}
          <div className="flex flex-col flex-1 min-w-0">
             {/* If in selection mode, we use the div wrapper click, if not, Link works */}
            {selectionMode ? (
                <div className="block">
                     <h3 className="text-xl font-subtitle text-white truncate">{name}</h3>
                </div>
            ) : (
                <Link href={`/plants/${id}`} className="hover:text-brand-primary transition-colors duration-300 block">
                    <h3 className="text-xl font-subtitle text-white truncate">{name}</h3>
                </Link>
            )}
            
            {/* Etiqueta de etapa con animación */}
            <motion.span 
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full w-fit mt-2 border ${stageInfo.bgColor} ${stageInfo.textColor} ${stageInfo.borderColor}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{stageInfo.icon}</span>
              <span>{stage}</span>
            </motion.span>
          </div>
          
          {/* Botón de riego con animación - Hidden in selection mode */}
          {!selectionMode && (
            <motion.button
                onClick={handleWater}
                disabled={loading}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                isWatered
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                    : 'bg-brand-card border-[#333] text-brand-muted hover:border-brand-primary hover:text-brand-primary'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isWatered ? "¡Regada hoy!" : "Regar planta"}
            >
                {loading ? (
                <span className="animate-spin text-lg">🌀</span>
                ) : isWatered ? (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg"
                >
                    💧
                </motion.span>
                ) : (
                <span className="text-lg">🚰</span>
                )}
            </motion.button>
          )}
        </div>
        
        {/* Cycle Name if available */}
        {cycleName && (
            <p className="text-xs text-slate-500 truncate font-body mb-2">Ciclo: {cycleName}</p>
        )}

        {/* Información secundaria */}
        <div className="flex justify-between items-end pt-4 border-t border-[#333]">
          <div>
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Edad</p>
            <p className="text-white font-bold text-lg">
              {current_age_days ?? days ?? 0}
              <span className="text-sm text-brand-muted"> días</span>
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Riego</p>
            <p className={`font-bold text-lg ${isWatered ? "text-brand-primary" : "text-white"}`}>
              {lastWater === "Hoy" ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  <span>Hoy</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    💧
                  </motion.span>
                </motion.span>
              ) : (
                lastWater
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
