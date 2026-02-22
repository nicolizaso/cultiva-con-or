"use client";

import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Plant } from "@/app/lib/types";
import { groupPlants } from "@/app/lib/plant-grouping";

interface SpaceInfo {
  id: number;
  name: string;
  type: string;
}

export interface CycleWithPlantsAndSpace {
  id: number;
  name: string;
  start_date: string;
  space_id: number;
  plants: Plant[];
  spaces: SpaceInfo | null; // Allow null just in case
}

interface CycleStatusCardProps {
  cycle: CycleWithPlantsAndSpace;
}

export default function CycleStatusCard({ cycle }: CycleStatusCardProps) {
  const daysDiff = Math.floor(
    (new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const groupedPlants = groupPlants(cycle.plants || []);

  return (
    <div className="group relative bg-[#12141C] rounded-3xl p-6 border border-white/5 hover:border-brand-primary/30 transition-all duration-300 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {cycle.spaces && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase font-body">
                {cycle.spaces.name}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase font-body">
              Día {daysDiff}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-light font-title text-white">{cycle.name}</h3>
        </div>
        <Link
          href={`/cycles/${cycle.id}`}
          className="mt-4 md:mt-0 bg-white text-black px-6 py-2 rounded-full text-sm font-bold font-body hover:bg-brand-primary hover:text-white transition-all shadow-lg shadow-brand-primary/10 flex items-center gap-2"
        >
          Ver Ciclo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Plants List */}
      <div className="relative z-10">
        <p className="text-xs text-slate-500 uppercase font-bold mb-3 font-body">
          Plantas ({cycle.plants?.length || 0})
        </p>
        <div className="flex flex-wrap gap-2">
          {groupedPlants.length > 0 ? (
            groupedPlants.map((group) => (
              <Link
                key={group.id}
                href={group.href}
                className="flex items-center gap-2 bg-[#0B0C10] border border-white/10 rounded-full pr-3 pl-1 py-1 hover:border-brand-primary/50 transition-colors group/badge"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 group-hover/badge:bg-slate-700 transition-colors">
                  <Leaf className="w-3 h-3" />
                </div>
                <span className="text-xs text-slate-300 font-body group-hover/badge:text-white transition-colors">
                  {group.label}
                </span>
              </Link>
            ))
          ) : (
             <span className="text-xs text-slate-500 font-body italic">Sin plantas registradas</span>
          )}
        </div>
      </div>
    </div>
  );
}
