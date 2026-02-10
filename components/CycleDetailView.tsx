"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plant } from "@/app/lib/types";
import { Thermometer, CloudRain, Activity, Droplets, ArrowRight, LayoutGrid, List as ListIcon } from "lucide-react";
import BulkWaterModal from "./BulkWaterModal";
import BulkStageModal from "./BulkStageModal";
import MeasurementModal from "./MeasurementModal";

interface CycleDetailViewProps {
  cycle: { id: number; name: string; start_date: string; spaces: { name: string; type: string }; };
  plants: Plant[];
  lastMeasurement?: { temperature: number; humidity: number; date: string } | null;
  history: any[];
}

export default function CycleDetailView({ cycle, plants, lastMeasurement }: CycleDetailViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);

  const vpd = lastMeasurement 
    ? ((0.61078 * Math.exp((17.27 * lastMeasurement.temperature) / (lastMeasurement.temperature + 237.3))) * (1 - (lastMeasurement.humidity / 100))).toFixed(2)
    : "-";

  const toggleSelectAll = () => {
    selectedPlants.length === plants.length ? setSelectedPlants([]) : setSelectedPlants(plants.map(p => p.id));
  };

  const toggleSelectPlant = (id: number) => {
    selectedPlants.includes(id) ? setSelectedPlants(selectedPlants.filter(p => p !== id)) : setSelectedPlants([...selectedPlants, id]);
  };

  return (
    <div className="space-y-6">
      {/* 1. DASHBOARD AMBIENTAL (KPIs con Iconos) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Temperatura */}
        <div onClick={() => setIsMeasureModalOpen(true)} className="bg-[#12141C] border border-white/5 p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-brand-primary/50 transition-colors group">
            <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Temperatura</p>
                <div className="text-3xl font-light font-title text-white">
                    {lastMeasurement ? `${lastMeasurement.temperature}°C` : "--"}
                </div>
            </div>
            <Thermometer className="text-brand-primary w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
        </div>

        {/* Humedad */}
        <div className="bg-[#12141C] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Humedad</p>
                <div className="text-3xl font-light font-title text-white">
                    {lastMeasurement ? `${lastMeasurement.humidity}%` : "--"}
                </div>
            </div>
            <CloudRain className="text-blue-500 w-8 h-8 opacity-80" strokeWidth={1.5} />
        </div>

        {/* VPD */}
        <div className="bg-[#12141C] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">VPD (kPa)</p>
                <div className={`text-3xl font-light font-title ${!lastMeasurement ? 'text-slate-500' : parseFloat(vpd) < 0.4 || parseFloat(vpd) > 1.6 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {lastMeasurement ? `${vpd}` : "--"}
                </div>
            </div>
            <Activity className="text-purple-500 w-8 h-8 opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      {/* 2. TOOLBAR & LISTA */}
      <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
            <h2 className="text-white font-bold whitespace-nowrap text-sm">{selectedPlants.length} seleccionadas</h2>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex gap-2">
                <button disabled={selectedPlants.length === 0} onClick={() => setIsWaterModalOpen(true)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors disabled:opacity-30 flex items-center gap-1">
                    <Droplets size={12} /> Regar
                </button>
                <button disabled={selectedPlants.length === 0} onClick={() => setIsStageModalOpen(true)} className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors disabled:opacity-30 flex items-center gap-1">
                    <ArrowRight size={12} /> Etapa
                </button>
            </div>
        </div>

        <div className="flex bg-[#0B0C10] p-1 rounded-lg border border-white/5">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded transition-all ${viewMode === 'table' ? 'bg-[#1a1a1a] text-white' : 'text-slate-500 hover:text-white'}`}><ListIcon size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-[#1a1a1a] text-white' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={16} /></button>
        </div>
      </div>

      {/* 3. LISTA (TABLE) */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto bg-[#12141C] border border-white/5 rounded-2xl">
            <table className="w-full text-left text-sm">
                <thead className="bg-[#0B0C10] text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                        <th className="p-4 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedPlants.length === plants.length && plants.length > 0} className="rounded border-slate-700 bg-[#1a1a1a] accent-brand-primary" /></th>
                        <th className="p-4">Planta</th>
                        <th className="p-4">Etapa</th>
                        <th className="p-4">Edad</th>
                        <th className="p-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {plants.map(plant => (
                        <tr key={plant.id} className={`hover:bg-white/5 transition-colors ${selectedPlants.includes(plant.id) ? 'bg-brand-primary/5' : ''}`}>
                            <td className="p-4"><input type="checkbox" checked={selectedPlants.includes(plant.id)} onChange={() => toggleSelectPlant(plant.id)} className="rounded border-slate-700 bg-[#1a1a1a] accent-brand-primary" /></td>
                            <td className="p-4 font-bold text-white flex items-center gap-3">
                                <Link href={`/plants/${plant.id}`} className="hover:text-brand-primary hover:underline">{plant.name}</Link>
                            </td>
                            <td className="p-4"><span className="text-[10px] px-2 py-1 rounded border uppercase font-bold bg-[#1a1a1a] text-slate-300 border-white/10">{plant.stage === 'Esqueje' || plant.stage === 'Plantula' ? 'Plántula' : plant.stage}</span></td>
                            <td className="p-4 text-slate-400 font-body">{plant.current_age_days ?? plant.days ?? 0} d</td>
                            <td className="p-4 text-right"><Link href={`/plants/${plant.id}`} className="text-xs font-bold text-brand-primary hover:text-white flex items-center justify-end gap-1">VER <ArrowRight size={10} /></Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {plants.map(plant => (
                <div key={plant.id} onClick={() => toggleSelectPlant(plant.id)} className={`relative group bg-[#12141C] border rounded-2xl overflow-hidden cursor-pointer transition-all ${selectedPlants.includes(plant.id) ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-white/5 hover:border-slate-500'}`}>
                    <div className="absolute top-2 left-2 z-10"><input type="checkbox" checked={selectedPlants.includes(plant.id)} readOnly className="w-5 h-5 accent-brand-primary" /></div>
                    <div className="aspect-square bg-[#050608] relative">
                         {(plant as any).image_url ? (
                            <Image src={(plant as any).image_url} alt="" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         ) : (
                            <div className="flex items-center justify-center h-full text-brand-primary opacity-20"><LayoutGrid size={32} /></div>
                         )}
                    </div>
                    <div className="p-3">
                        <p className="font-bold text-white text-sm truncate">{plant.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{plant.stage === 'Esqueje' || plant.stage === 'Plantula' ? 'Plántula' : plant.stage}</p>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modales */}
      <BulkWaterModal isOpen={isWaterModalOpen} onClose={() => setIsWaterModalOpen(false)} selectedIds={selectedPlants} onSuccess={() => setSelectedPlants([])} />
      <BulkStageModal isOpen={isStageModalOpen} onClose={() => setIsStageModalOpen(false)} selectedIds={selectedPlants} onSuccess={() => setSelectedPlants([])} />
      <MeasurementModal isOpen={isMeasureModalOpen} onClose={() => setIsMeasureModalOpen(false)} cycleId={cycle.id} />
    </div>
  );
}