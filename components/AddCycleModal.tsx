"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Space } from "@/app/lib/types";

export default function AddCycleModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split('T')[0], // Fecha de hoy formato YYYY-MM-DD
    spaceId: "",
  });

  // 1. Cargar espacios al abrir el modal (o al montar)
  useEffect(() => {
    const fetchSpaces = async () => {
      const { data } = await supabase.from('spaces').select('*');
      if (data) setSpaces(data as Space[]);
    };
    fetchSpaces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.spaceId) {
      alert("Debes seleccionar un espacio");
      setLoading(false);
      return;
    }

    try {
      // 2. Crear el ciclo
      const { error } = await supabase
        .from('cycles')
        .insert([{ 
            name: formData.name, 
            start_date: formData.startDate,
            space_id: parseInt(formData.spaceId),
            is_active: true // Por defecto nace activo
        }]);

      if (error) throw error;

      setIsOpen(false);
      // Reset form
      setFormData({ 
        name: "", 
        startDate: new Date().toISOString().split('T')[0], 
        spaceId: "" 
      });
      router.refresh();

    } catch (error) {
      alert("Error al crear ciclo: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg px-4 py-2 rounded-lg font-title tracking-wide transition-colors shadow-lg shadow-brand-primary/20"
      >
        + NUEVO CICLO
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative bg-brand-card w-full max-w-sm rounded-2xl border border-[#333] shadow-2xl p-6 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-title text-brand-primary mb-4 uppercase">Nuevo Ciclo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Nombre Temporada</label>
                <input 
                  autoFocus
                  type="text"
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  placeholder="Ej: Verano 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Selector de Espacio */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Espacio Asignado</label>
                <select 
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none cursor-pointer"
                  value={formData.spaceId}
                  onChange={(e) => setFormData({...formData, spaceId: e.target.value})}
                >
                  <option value="">-- Selecciona un Espacio --</option>
                  {spaces.map(space => (
                    <option key={space.id} value={space.id}>
                      {space.type === 'Indoor' ? '🏠' : '☀️'} {space.name}
                    </option>
                  ))}
                </select>
                {spaces.length === 0 && (
                   <p className="text-xs text-red-400 mt-1">⚠️ Primero crea un Espacio.</p>
                )}
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Fecha Inicio</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 text-brand-muted hover:text-white font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg py-3 rounded-lg font-title tracking-wide transition disabled:opacity-50">
                  {loading ? "CREANDO..." : "CREAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}