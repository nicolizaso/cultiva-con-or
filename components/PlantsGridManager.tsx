"use client";

import { useState } from "react";
import PlantCard from "./plantcard";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { CheckSquare, Square, Trash2, X } from "lucide-react";
import { Plant as BasePlant } from "@/app/lib/types";

interface Plant extends BasePlant {
  cycles?: { name: string } | null;
}

interface PlantsGridManagerProps {
  plants: Plant[];
}

export default function PlantsGridManager({ plants }: PlantsGridManagerProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Toggle Selection Mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set()); // Clear selection when toggling
  };

  // Toggle Individual Plant Selection
  const togglePlantSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select All / Deselect All
  const toggleSelectAll = () => {
    if (selectedIds.size === plants.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(plants.map(p => p.id)));
    }
  }

  // Bulk Delete
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.size} plantas? Esta acción no se puede deshacer.`);
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      // Reset state and refresh
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting plants:", error);
      alert("Error al eliminar las plantas seleccionadas.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
         <div className="text-sm text-slate-500 font-bold">
            {plants.length} plantas
         </div>

         <div className="flex gap-2">
            {isSelectionMode && (
                <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase transition-colors"
                >
                    {selectedIds.size === plants.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                    {selectedIds.size === plants.length ? "Deseleccionar todo" : "Seleccionar todo"}
                </button>
            )}

            <button
                onClick={toggleSelectionMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-colors ${
                    isSelectionMode
                    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/50"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent"
                }`}
            >
                {isSelectionMode ? "Cancelar" : "Seleccionar"}
            </button>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants && plants.length > 0 ? (
          plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              cycleName={plant.cycles?.name}
              selectionMode={isSelectionMode}
              isSelected={selectedIds.has(plant.id)}
              onToggleSelection={() => togglePlantSelection(plant.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-[#12141C] rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500 font-body">No hay plantas registradas en ningún ciclo.</p>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {isSelectionMode && selectedIds.size > 0 && (
          <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#12141C] border border-white/10 p-2 rounded-full shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-4 fade-in">
              <span className="pl-4 text-sm font-bold text-white whitespace-nowrap">
                  {selectedIds.size} seleccionadas
              </span>
              <div className="w-px h-6 bg-white/10"></div>
              <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
              >
                  {isDeleting ? "Eliminando..." : (
                      <>
                        <Trash2 size={16} /> Eliminar
                      </>
                  )}
              </button>
              <button
                  onClick={() => { setSelectedIds(new Set()); setIsSelectionMode(false); }}
                  className="bg-white/5 hover:bg-white/10 text-slate-400 p-2 rounded-full transition-colors"
              >
                  <X size={20} />
              </button>
          </div>
      )}
    </div>
  );
}
