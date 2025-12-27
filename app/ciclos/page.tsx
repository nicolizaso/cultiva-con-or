"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import CycleCard from "@/components/CycleCard";
import { supabase } from "@/app/lib/supabase";

export default function CyclesPage() {
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        const { data: cyclesData } = await supabase
            .from('cycles')
            .select('*, plants(*)')
            .order('is_active', { ascending: false }) // Activos primero
            .order('start_date', { ascending: false });

        if (cyclesData) {
             const transformed = cyclesData.map((c: any) => {
                const startDate = new Date(c.start_date);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let stage = "Vegetativo";
                let stageDays = diffDays;
                if(diffDays < 7) stage = "Germinación";
                else if(diffDays < 21) stage = "Plántula";
                else if(diffDays > 60) stage = "Floración";

                const plant = c.plants && c.plants.length > 0 ? c.plants[0] : { name: 'Sin planta', id: 0 };

                return {
                    id: c.id,
                    name: c.name,
                    start_date: c.start_date,
                    stage: stage,
                    days: diffDays,
                    stage_days: stageDays,
                    plant_name: plant.name,
                    plant_id: plant.id,
                    next_task: null
                };
            });
            setCycles(transformed);
        }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#0B0C10] font-body text-slate-200 pb-20">
             <div className="max-w-md mx-auto px-[25px]">
                <GlobalHeader title="Laboratorio" subtitle="Todos los ciclos" />

                <div className="flex justify-between items-center mb-6">
                    <Link href="/" className="p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <button className="flex items-center gap-2 bg-brand-primary text-[#0B0C10] px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                        <Plus size={18} />
                        Nuevo Ciclo
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                         <div className="text-center py-10"><p>Cargando laboratorio...</p></div>
                    ) : cycles.length > 0 ? (
                        cycles.map(cycle => (
                            <CycleCard key={cycle.id} cycle={cycle} />
                        ))
                    ) : (
                        <div className="text-center py-20 opacity-50">
                            <p>No hay ciclos registrados.</p>
                        </div>
                    )}
                </div>
             </div>
        </main>
    );
}
