"use client";

import { useState, useMemo } from "react";
import PlantCard from "./plantcard";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { CheckSquare, Square, Trash2, X, FilterX } from "lucide-react";
import { Plant as BasePlant, Cycle, Space } from "@/app/lib/types";

interface Plant extends BasePlant {
  cycles?: { id: number; name: string; space_id: number } | null;
}

interface PlantsGridManagerProps {
  plants: Plant[];
  cycles: Pick<Cycle, 'id' | 'name' | 'space_id'>[];
  spaces: Pick<Space, 'id' | 'name'>[];
}

export default function PlantsGridManager({ plants, cycles, spaces }: PlantsGridManagerProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter States
  const [selectedCycleId, setSelectedCycleId] = useState<string>("all");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("all");

  const router = useRouter();

  // Filter Logic
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Filter by Cycle
      if (selectedCycleId !== "all") {
        if (plant.cycle_id !== Number(selectedCycleId)) return false;
      }

      // Filter by Space
      if (selectedSpaceId !== "all") {
        // If the plant has no cycle, it conceptually has no space assignment in this context
        if (!plant.cycles) return false;
        if (plant.cycles.space_id !== Number(selectedSpaceId)) return false;
      }

      return true;
    });
  }, [plants, selectedCycleId, selectedSpaceId]);

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
    // Determine if all *filtered* plants are selected
    const allFilteredSelected = filteredPlants.length > 0 && filteredPlants.every(p => selectedIds.has(p.id));

    if (allFilteredSelected) {
        // Deselect only the filtered plants
        const newSelected = new Set(selectedIds);
        filteredPlants.forEach(p => newSelected.delete(p.id));
        setSelectedIds(newSelected);
    } else {
        // Select all filtered plants
        const newSelected = new Set(selectedIds);
        filteredPlants.forEach(p => newSelected.add(p.id));
        setSelectedIds(newSelected);
    }
  }

  // Helper to check if all filtered are selected
  const isAllSelected = filteredPlants.length > 0 && filteredPlants.every(p => selectedIds.has(p.id));

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

  // Clear Filters
  const clearFilters = () => {
    setSelectedCycleId("all");
    setSelectedSpaceId("all");
  };

  const hasFilters = selectedCycleId !== "all" || selectedSpaceId !== "all";

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-[#12141C] border border-white/5 rounded-2xl items-start md:items-center">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Space Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-bold uppercase ml-1">Espacio</label>
                <select
                    value={selectedSpaceId}
                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                    className="w-full bg-[#0B0C10] text-slate-300 text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none cursor-pointer"
                >
                    <option value="all">Todos los espacios</option>
                    {spaces.map(space => (
                        <option key={space.id} value={space.id}>{space.name}</option>
                    ))}
                </select>
            </div>

            {/* Cycle Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-bold uppercase ml-1">Ciclo</label>
                <select
                    value={selectedCycleId}
                    onChange={(e) => setSelectedCycleId(e.target.value)}
                    className="w-full bg-[#0B0C10] text-slate-300 text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary/50 transition-colors appearance-none cursor-pointer"
                >
                    <option value="all">Todos los ciclos</option>
                    {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {hasFilters && (
             <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors md:mt-5"
            >
                <FilterX size={16} />
                Limpiar
            </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
         <div className="text-sm text-slate-500 font-bold">
            {filteredPlants.length} plantas {hasFilters && <span className="text-slate-600 font-normal">(filtrado de {plants.length})</span>}
         </div>

         <div className="flex gap-2">
            {isSelectionMode && (
                <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase transition-colors"
                >
                    {isAllSelected ? <CheckSquare size={16}/> : <Square size={16}/>}
                    {isAllSelected ? "Deseleccionar" : "Seleccionar todo"}
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
        {filteredPlants.length > 0 ? (
          filteredPlants.map((plant) => (
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
            <p className="text-slate-500 font-body">
                {hasFilters ? "No se encontraron plantas con estos criterios." : "No hay plantas registradas en ningún ciclo."}
            </p>
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
