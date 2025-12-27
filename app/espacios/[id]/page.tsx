"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Home, Thermometer, Droplets, Wind, Sun } from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import CycleCard from "@/components/CycleCard";
import { supabase } from "@/app/lib/supabase";

export default function SpaceDetailPage() {
    const params = useParams();
    const id = params?.id;

    const [space, setSpace] = useState<any>(null);
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        // Fetch Space Details
        const { data: spaceData } = await supabase.from('spaces').select('*').eq('id', id).single();
        if (spaceData) setSpace(spaceData);

        // Fetch Cycles in this Space
        const { data: cyclesData } = await supabase
            .from('cycles')
            .select('*, plants(*)')
            .eq('space_id', id)
            .eq('is_active', true);

         if (cyclesData) {
             const transformed = cyclesData.map((c: any) => {
                // Logic duplicada (idealmente mover a helper)
                const startDate = new Date(c.start_date);
                const now = new Date();
                const diffDays = Math.ceil(Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                let stage = "Vegetativo";
                if(diffDays < 7) stage = "Germinación";

                const plant = c.plants && c.plants.length > 0 ? c.plants[0] : { name: 'Sin planta', id: 0 };
                return {
                    id: c.id,
                    name: c.name,
                    start_date: c.start_date,
                    stage: stage,
                    days: diffDays,
                    stage_days: diffDays,
                    plant_name: plant.name,
                    plant_id: plant.id,
                    next_task: null
                };
            });
            setCycles(transformed);
        }
        setLoading(false);
    };

    if (!space && !loading) return <div className="text-center py-20 text-white">Espacio no encontrado</div>;

    return (
        <main className="min-h-screen bg-[#0B0C10] font-body text-slate-200 pb-20">
             <div className="max-w-md mx-auto px-[25px]">
                <GlobalHeader title="Espacio" subtitle={space?.name} />

                {/* Header del Espacio */}
                <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 shadow-lg mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Home size={100} />
                    </div>

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-4 transition-colors">
                            <ArrowLeft size={14} /> Volver
                        </Link>

                        <h1 className="text-3xl font-title font-bold text-white mb-1">{space?.name}</h1>
                        <p className="text-sm text-brand-primary font-bold uppercase tracking-wider mb-6">{space?.type || 'Indoor'}</p>

                        {/* Stats del Espacio (Mock) */}
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-[#0B0C10] rounded-xl p-2 flex flex-col items-center gap-1 border border-white/5">
                                <Thermometer size={16} className="text-orange-400" />
                                <span className="text-xs font-bold">24°C</span>
                            </div>
                            <div className="bg-[#0B0C10] rounded-xl p-2 flex flex-col items-center gap-1 border border-white/5">
                                <Droplets size={16} className="text-blue-400" />
                                <span className="text-xs font-bold">60%</span>
                            </div>
                            <div className="bg-[#0B0C10] rounded-xl p-2 flex flex-col items-center gap-1 border border-white/5">
                                <Wind size={16} className="text-slate-400" />
                                <span className="text-xs font-bold">On</span>
                            </div>
                             <div className="bg-[#0B0C10] rounded-xl p-2 flex flex-col items-center gap-1 border border-white/5">
                                <Sun size={16} className="text-yellow-400" />
                                <span className="text-xs font-bold">18/6</span>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="font-title font-bold text-white text-lg mb-4">Ciclos en este espacio</h3>

                <div className="space-y-4">
                     {loading ? (
                         <p>Cargando...</p>
                    ) : cycles.length > 0 ? (
                        cycles.map(cycle => (
                            <CycleCard key={cycle.id} cycle={cycle} />
                        ))
                    ) : (
                        <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center">
                            <p className="text-slate-500 text-sm">Este espacio está vacío.</p>
                        </div>
                    )}
                </div>

             </div>
        </main>
    );
}
