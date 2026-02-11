"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

interface EditPlantModalProps {
  plant: {
    id: number;
    name: string;
    stage: string;
    cycle_id: number;
    planted_at?: string;
  };
}

export default function EditPlantModal({ plant }: EditPlantModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState<any[]>([]);

  // Estado del formulario (inicia con los datos actuales)
  const [formData, setFormData] = useState({
    name: plant.name,
    stage: plant.stage,
    cycleId: plant.cycle_id,
    planted_at: plant.planted_at ? new Date(plant.planted_at).toISOString().split("T")[0] : '',
  });

  // Cargar ciclos disponibles (por si queremos moverla)
  useEffect(() => {
    if (isOpen) {
      const fetchCycles = async () => {
        const { data } = await supabase
          .from('cycles')
          .select('id, name')
          .eq('is_active', true) // Solo ciclos activos
          .order('created_at', { ascending: false });
        if (data) setCycles(data);
      };
      fetchCycles();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        name: formData.name,
        stage: formData.stage,
        cycle_id: formData.cycleId,
        planted_at: formData.planted_at
      };

      if (formData.stage !== plant.stage) {
        updates.stage_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plant.id);

      if (error) throw error;

      setIsOpen(false);
      router.refresh(); // Actualiza la página de fondo
    } catch (error) {
      alert("Error al actualizar: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la planta "${plant.name}"? Esta acción no se puede deshacer.`)) return;

    setLoading(true);
    try {
        const { error } = await supabase
            .from('plants')
            .delete()
            .eq('id', plant.id);

        if (error) throw error;

        setIsOpen(false);
        router.refresh();
    } catch (error) {
        alert("Error al eliminar: " + error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      {/* BOTÓN DISPARADOR (Lápiz) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#222] hover:bg-[#333] text-white p-2 rounded-lg border border-[#333] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
      >
        ✏️ Editar
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative bg-brand-card w-full max-w-sm rounded-2xl border border-[#333] shadow-2xl p-6 animate-in zoom-in duration-200">
            
            <h2 className="text-xl font-subtitle text-brand-primary mb-1 uppercase">Editar Planta</h2>
            <p className="text-xs text-brand-muted mb-6">Modifica los datos o mueve la planta.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Nombre / Genética</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Etapa (El cambio más importante) */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Etapa Actual</label>
                <select 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                >
                  <option value="Germinación">🌱 Germinación</option>
                  <option value="Plantula">🌱 Plántula</option>
                  <option value="Vegetación">🌿 Vegetación</option>
                  <option value="Floración">🌸 Floración</option>
                  <option value="Secado">🍂 Secado</option>
                  <option value="Curado">🏺 Curado</option>
                </select>
              </div>

              {/* Fecha de Plantado */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Fecha de Inicio</label>
                <input
                  type="date"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  value={formData.planted_at}
                  onChange={(e) => setFormData({...formData, planted_at: e.target.value})}
                />
              </div>

              {/* Ciclo (Mover de armario) */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Ciclo / Armario</label>
                <select 
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  value={formData.cycleId}
                  onChange={(e) => setFormData({...formData, cycleId: parseInt(e.target.value)})}
                >
                  {cycles.map(cycle => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  *Cuidado: Esto moverá la planta a otro grupo.
                </p>
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
                  {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                </button>
              </div>

              {/* Botón Eliminar */}
              <div className="mt-4 border-t border-[#333] pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  🗑 Eliminar Planta
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}