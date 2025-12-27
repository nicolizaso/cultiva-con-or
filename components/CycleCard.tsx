"use client";

import Link from "next/link";
import { ArrowUpRight, Droplets, Thermometer, Wind } from "lucide-react";

interface CycleCardProps {
    cycle: {
        id: number;
        name: string;
        start_date: string;
        stage: string; // Etapa actual
        days: number; // Días totales
        stage_days: number; // Días en etapa actual
        plant_name: string;
        plant_id: number;
        image_url?: string;
        next_task?: {
            id: number;
            title: string;
            type: string;
            is_completed: boolean;
        } | null;
    };
}

const STAGES_ORDER = ['Germinación', 'Plántula', 'Vegetativo', 'Floración', 'Secado', 'Curado'];

const getProgress = (stage: string) => {
    switch (stage) {
        case 'Germinación': return { percent: 10, color: 'bg-[#8B4513]' }; // Marrón
        case 'Plántula': return { percent: 20, color: 'bg-sky-400' }; // Celeste
        case 'Vegetativo': return { percent: 50, color: 'bg-emerald-600' }; // Verde Oscuro
        case 'Floración': return { percent: 80, color: 'bg-purple-600' }; // Violeta Oscuro
        case 'Secado': return { percent: 90, color: 'bg-orange-500' }; // Naranja
        case 'Curado': return { percent: 100, color: 'bg-yellow-400' }; // Amarillo
        default: return { percent: 0, color: 'bg-slate-600' };
    }
};

export default function CycleCard({ cycle }: CycleCardProps) {
    const { percent, color } = getProgress(cycle.stage);

    return (
        <div className="bg-[#12141C] border border-white/5 rounded-3xl overflow-hidden shadow-lg flex flex-col group">

            {/* Cabecera / Imagen de Fondo sutil o degradado */}
            <div className="relative p-5 pb-0">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-title font-bold text-white">Día {cycle.days}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-[#0B0C10] ${color.replace('bg-', 'bg-')}/80`}>
                                {cycle.stage} - Día {cycle.stage_days}
                            </span>
                        </div>

                        <Link href={`/plants/${cycle.plant_id}`} className="text-sm text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-1">
                            {cycle.plant_name}
                            <ArrowUpRight size={12} />
                        </Link>
                    </div>

                    <Link
                        href={`/ciclos?id=${cycle.id}`} // En realidad debería abrir el detalle del ciclo o ir a /ciclos/[id] si existiera, pero pide redirigir a /ciclos o ver detalles
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-primary hover:text-[#0B0C10] flex items-center justify-center transition-all text-white border border-white/10"
                    >
                        <ArrowUpRight size={20} />
                    </Link>
                 </div>
            </div>

            {/* Cuerpo */}
            <div className="p-5 pt-2 flex-1 flex flex-col gap-4">

                {/* Tarea del día si existe */}
                {cycle.next_task ? (
                    <div className={`p-3 rounded-xl border border-dashed border-white/10 flex items-center gap-3 bg-white/[0.02]`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-brand-primary/10 text-brand-primary`}>
                            {/* Icono simple, idealmente dinámico */}
                            <Droplets size={14} />
                         </div>
                         <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Para hoy</p>
                            <p className="text-sm text-slate-200 truncate">{cycle.next_task.title}</p>
                         </div>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl border border-dashed border-white/5 flex items-center justify-center bg-white/[0.01]">
                        <p className="text-xs text-slate-600">Sin tareas para hoy</p>
                    </div>
                )}
            </div>

            {/* Barra de Progreso */}
            <div className="h-2 w-full bg-[#0B0C10] relative">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
}
