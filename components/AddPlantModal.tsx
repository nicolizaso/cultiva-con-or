"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

// Recibimos el ID del ciclo directamente desde el padre
interface Props {
  cycleId: number; 
  cycleName: string;
}

export default function AddPlantModal({ cycleId, cycleName }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Controla si se ve o no
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    stage: "Vegetación",
    days: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('plants')
        .insert([
          { 
            name: formData.name, 
            stage: formData.stage, 
            days: formData.days,
            last_water: 'Nunca',
            cycle_id: cycleId // Usamos el ID que nos pasan por props
          }
        ]);

      if (error) throw error;

      // Éxito:
      setIsOpen(false); // Cerramos el modal
      setFormData({ name: "", stage: "Vegetación", days: 0 }); // Limpiamos formulario
      router.refresh(); // Recargamos solo los datos de la página de fondo

    } catch (error) {
      alert("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. EL BOTÓN DISPARADOR (Lo que se ve en la Home) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg px-4 py-2 rounded-lg font-title tracking-wide transition-colors text-sm md:text-base shadow-lg shadow-brand-primary/20"
      >
        + NUEVA PLANTA
      </button>

      {/* 2. EL MODAL (Solo se renderiza si isOpen es true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Fondo oscuro (Overlay) - Cierra al hacer click fuera */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* La Caja del Formulario */}
          <div className="relative bg-brand-card w-full max-w-md rounded-2xl border border-[#333] shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            
            <h2 className="text-2xl font-title text-brand-primary mb-1 uppercase">Nueva Planta</h2>
            <p className="text-xs text-brand-muted mb-6">
              Agregando a: <span className="text-white font-bold">{cycleName}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Genética / Nombre</label>
                <input 
                  autoFocus
                  type="text"
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none transition"
                  placeholder="Ej: Gorilla Glue"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Etapa y Días en fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Etapa</label>
                    <select 
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    >
                    <option value="Germinación">🌱 Germ.</option>
                    <option value="Esqueje">✂️ Esqueje</option>
                    <option value="Vegetación">🌿 Vege</option>
                    <option value="Floración">🌸 Flora</option>
                    </select>
                </div>
                <div>
                    <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Días</label>
                    <input 
                    type="number"
                    min="0"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                    value={formData.days}
                    onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
                    />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 text-brand-muted hover:text-white font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg py-3 rounded-lg font-title tracking-wide transition disabled:opacity-50"
                >
                  {loading ? "GUARDANDO..." : "CREAR"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}