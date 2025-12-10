"use client"; // Necesitamos interactividad para el formulario

import { useState } from "react";
import { supabase } from "../lib/supabase"; // Importamos la conexión (ajusta la ruta si es necesario)
import { useRouter } from "next/navigation"; // Para redirigir al usuario al terminar
import Link from "next/link";

export default function NewPlantPage() {
  const router = useRouter(); // El "GPS" de la app
  const [loading, setLoading] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    stage: "Vegetación", // Valor por defecto
    days: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true);

    try {
      // 1. Insertamos en Supabase
      const { error } = await supabase
        .from('plants')
        .insert([
          { 
            name: formData.name, 
            stage: formData.stage, 
            days: formData.days,
            last_water: 'Nunca' // Valor inicial obligatorio
          }
        ]);

      if (error) throw error;

      // 2. Si sale bien, volvemos al inicio y refrescamos los datos
      router.push("/"); 
      router.refresh(); 

    } catch (error) {
      alert("Error al guardar la planta: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md">
        <h1 className="text-2xl font-bold text-emerald-500 mb-6">🌱 Nueva Planta</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Nombre / Genética</label>
            <input 
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none transition"
              placeholder="Ej: Amnesia Haze"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Etapa */}
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Etapa Actual</label>
            <select 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value})}
            >
              <option value="Germinación">Germinación</option>
              <option value="Esqueje">Esqueje</option>
              <option value="Vegetación">Vegetación</option>
              <option value="Floración">Floración</option>
            </select>
          </div>

          {/* Días */}
          <div>
            <label className="block text-slate-400 mb-1 text-sm">Días de vida</label>
            <input 
              type="number"
              min="0"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
              value={formData.days}
              onChange={(e) => setFormData({...formData, days: parseInt(e.target.value)})}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 mt-6">
            <Link 
              href="/"
              className="flex-1 py-3 text-center rounded-lg text-slate-400 hover:bg-slate-700 transition"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Crear Planta"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}