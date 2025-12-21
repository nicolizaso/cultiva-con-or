"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plant } from "@/app/lib/types";
// Importamos los 3 modales que creamos
import BulkWaterModal from "./BulkWaterModal";
import BulkStageModal from "./BulkStageModal";
import MeasurementModal from "./MeasurementModal";

interface CycleDetailViewProps {
  cycle: {
    id: number;
    name: string;
    start_date: string;
    spaces: { name: string; type: string };
  };
  plants: Plant[];
  lastMeasurement?: { temperature: number; humidity: number; date: string } | null;
}

export default function CycleDetailView({ cycle, plants, lastMeasurement }: CycleDetailViewProps) {
  // Estados de vista y selección
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  
  // Estados de los Modales
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);

  // Calcular VPD (Fórmula aproximada)
  const vpd = lastMeasurement 
    ? ((0.61078 * Math.exp((17.27 * lastMeasurement.temperature) / (lastMeasurement.temperature + 237.3))) * (1 - (lastMeasurement.humidity / 100))).toFixed(2)
    : "-";

  // Manejo de selección masiva
  const toggleSelectAll = () => {
    if (selectedPlants.length === plants.length) {
      setSelectedPlants([]);
    } else {
      setSelectedPlants(plants.map(p => p.id));
    }
  };

  // Manejo de selección individual
  const toggleSelectPlant = (id: number) => {
    if (selectedPlants.includes(id)) {
      setSelectedPlants(selectedPlants.filter(p => p !== id));
    } else {
      setSelectedPlants([...selectedPlants, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. DASHBOARD AMBIENTAL REAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tarjeta Temperatura (Clic para registrar) */}
        <div 
            onClick={() => setIsMeasureModalOpen(true)}
            className="bg-[#1a1a1a] border border-[#333] p-5 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-primary/50 transition-colors group relative overflow-hidden"
        >
            <div>
                <p className="text-brand-muted text-xs uppercase font-bold mb-1">Temperatura</p>
                <div className="text-3xl font-title text-white">
                    {lastMeasurement ? `${lastMeasurement.temperature}°C` : "--"}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    {lastMeasurement ? `Reg: ${new Date(lastMeasurement.date).toLocaleDateString()}` : "Sin datos"}
                </p>
            </div>
            <div className="text-4xl group-hover:scale-110 transition-transform">🌡️</div>
            
            {/* Overlay "Registrar" al pasar mouse */}
            <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">+ REGISTRAR</span>
            </div>
        </div>

        {/* Tarjeta Humedad */}
        <div className="bg-[#1a1a1a] border border-[#333] p-5 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-brand-muted text-xs uppercase font-bold mb-1">Humedad (HR)</p>
                <div className="text-3xl font-title text-white">
                    {lastMeasurement ? `${lastMeasurement.humidity}%` : "--"}
                </div>
            </div>
            <div className="text-4xl">💧</div>
        </div>

        {/* Tarjeta VPD */}
        <div className="bg-[#1a1a1a] border border-[#333] p-5 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-brand-muted text-xs uppercase font-bold mb-1">VPD (Aprox)</p>
                <div className={`text-3xl font-title ${!lastMeasurement ? 'text-gray-500' : parseFloat(vpd) < 0.4 || parseFloat(vpd) > 1.6 ? 'text-red-400' : 'text-green-400'}`}>
                    {lastMeasurement ? `${vpd} kPa` : "--"}
                </div>
            </div>
            <div className="text-4xl">🍃</div>
        </div>
      </div>

      {/* 2. TOOLBAR DE ACCIONES MASIVAS */}
      <div className="bg-brand-card border border-[#333] p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30 shadow-xl">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-white font-bold whitespace-nowrap">
                {selectedPlants.length} seleccionadas
            </h2>
            <div className="h-6 w-px bg-[#444]"></div>
            
            {/* Botones de Acción */}
            <div className="flex gap-2">
                <button 
                    disabled={selectedPlants.length === 0}
                    onClick={() => setIsWaterModalOpen(true)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    💧 Regar
                </button>
                <button 
                    disabled={selectedPlants.length === 0}
                    onClick={() => setIsStageModalOpen(true)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    🚀 Etapa
                </button>
                <button 
                    disabled={selectedPlants.length === 0}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    🗑️ Borrar
                </button>
            </div>
        </div>

        {/* Switch de Vistas */}
        <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
            <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${viewMode === 'table' ? 'bg-[#333] text-white' : 'text-brand-muted hover:text-white'}`}
            >
                📋 Tabla
            </button>
            <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${viewMode === 'grid' ? 'bg-[#333] text-white' : 'text-brand-muted hover:text-white'}`}
            >
                🖼️ Fotos
            </button>
        </div>
      </div>

      {/* 3. LISTA DE PLANTAS (TABLA vs GRID) */}
      {viewMode === 'table' ? (
        // --- VISTA TABLA (DATA GRID) ---
        <div className="overflow-x-auto bg-[#1a1a1a] border border-[#333] rounded-xl">
            <table className="w-full text-left text-sm">
                <thead className="bg-[#111] text-brand-muted uppercase text-xs">
                    <tr>
                        <th className="p-4 w-10">
                            <input type="checkbox" onChange={toggleSelectAll} checked={selectedPlants.length === plants.length && plants.length > 0} className="rounded border-gray-600 bg-[#222]" />
                        </th>
                        <th className="p-4">Planta / Genética</th>
                        <th className="p-4">Etapa</th>
                        <th className="p-4">Edad</th>
                        <th className="p-4">Último Riego</th>
                        <th className="p-4 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                    {plants.map(plant => (
                        <tr key={plant.id} className={`hover:bg-[#222] transition-colors ${selectedPlants.includes(plant.id) ? 'bg-brand-primary/5' : ''}`}>
                            <td className="p-4">
                                <input 
                                    type="checkbox" 
                                    checked={selectedPlants.includes(plant.id)}
                                    onChange={() => toggleSelectPlant(plant.id)}
                                    className="rounded border-gray-600 bg-[#222]" 
                                />
                            </td>
                            <td className="p-4 font-bold text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#333] overflow-hidden relative">
                                    {(plant as any).image_url && <Image src={(plant as any).image_url} alt="" fill className="object-cover" />}
                                </div>
                                <Link href={`/plants/${plant.id}`} className="hover:text-brand-primary hover:underline">
                                    {plant.name}
                                </Link>
                            </td>
                            <td className="p-4">
                                <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${
                                    plant.stage === 'Floración' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 
                                    plant.stage === 'Vegetación' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 
                                    'border-gray-500/30 text-gray-400'
                                }`}>
                                    {plant.stage}
                                </span>
                            </td>
                            <td className="p-4 text-brand-muted">{plant.days} días</td>
                            <td className="p-4 text-brand-muted">{plant.last_water || '-'}</td>
                            <td className="p-4 text-right">
                                <Link href={`/plants/${plant.id}`} className="text-xs font-bold text-brand-primary hover:text-white">
                                    VER ➜
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        // --- VISTA GRID (Visual) ---
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {plants.map(plant => (
                <div 
                    key={plant.id} 
                    onClick={() => toggleSelectPlant(plant.id)}
                    className={`relative group bg-[#1a1a1a] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                        selectedPlants.includes(plant.id) ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-[#333] hover:border-gray-500'
                    }`}
                >
                    <div className="absolute top-2 left-2 z-10">
                        <input 
                            type="checkbox" 
                            checked={selectedPlants.includes(plant.id)} 
                            readOnly
                            className="w-5 h-5 accent-brand-primary"
                        />
                    </div>
                    <div className="aspect-square bg-[#222] relative">
                         {(plant as any).image_url ? (
                            <Image src={(plant as any).image_url} alt="" fill className="object-cover" />
                         ) : (
                            <div className="flex items-center justify-center h-full text-2xl">🌿</div>
                         )}
                    </div>
                    <div className="p-3">
                        <p className="font-bold text-white text-sm truncate">{plant.name}</p>
                        <p className="text-xs text-brand-muted">{plant.stage}</p>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- MODALES --- */}
      
      <BulkWaterModal 
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        selectedIds={selectedPlants}
        onSuccess={() => setSelectedPlants([])}
      />

      <BulkStageModal 
        isOpen={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        selectedIds={selectedPlants}
        onSuccess={() => setSelectedPlants([])}
      />

      <MeasurementModal 
        isOpen={isMeasureModalOpen}
        onClose={() => setIsMeasureModalOpen(false)}
        cycleId={cycle.id}
      />

    </div>
  );
}