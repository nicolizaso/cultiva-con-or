"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Space } from "@/app/lib/types";
import { Plus } from "lucide-react"; 

export default function AddCycleModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split('T')[0],
    spaceId: "",
  });

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
      const { error } = await supabase
        .from('cycles')
        .insert([
          {
            name: formData.name,
            start_date: formData.startDate,
            space_id: Number(formData.spaceId),
            is_active: true,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ]);

      if (error) throw error;

      setIsOpen(false);
      setFormData({ name: "", startDate: new Date().toISOString().split('T')[0], spaceId: "" });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error creando ciclo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-[#008f85] text-[#0B0C10] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
      >
        <Plus size={18} strokeWidth={2.5} />
        NUEVO CICLO
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#12141C] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-[#0B0C10]/50 p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white tracking-wide">Iniciar Nuevo Ciclo</h2>
              <p className="text-slate-500 text-xs mt-1">Configura tu próximo cultivo</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-slate-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Nombre del Ciclo</label>
                <input 
                  type="text"
                  placeholder="Ej: Verano 2024"
                  required
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Espacio Asignado</label>
                <select 
                  required
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none appearance-none transition-colors"
                  value={formData.spaceId}
                  onChange={(e) => setFormData({...formData, spaceId: e.target.value})}
                >
                  <option value="">Seleccionar Espacio...</option>
                  {spaces.map(space => (
                    <option key={space.id} value={space.id}>
                       {space.type === 'Indoor' ? '🏠' : '☀️'} {space.name}
                    </option>
                  ))}
                </select>
                {spaces.length === 0 && (
                   <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                     ⚠️ Primero debes crear un Espacio en la sección Mis Espacios.
                   </p>
                )}
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 text-[10px] font-bold uppercase tracking-wider">Fecha de Inicio</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors scheme-dark"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 py-3 text-slate-400 hover:text-white font-bold text-xs uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-brand-primary hover:bg-[#008f85] text-[#0B0C10] py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "CREANDO..." : "CONFIRMAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}