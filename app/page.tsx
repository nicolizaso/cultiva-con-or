import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import GlobalHeader from "@/components/GlobalHeader";
import TasksCard from "@/components/TasksCard";
import { Plant } from "./lib/types";
// Importamos los iconos necesarios
import { Leaf, RefreshCw, CalendarDays, Warehouse, ArrowRight } from "lucide-react";

// ... (Interfaces iguales) ...
interface SpaceInfo {
    id: number;
    name: string;
    type: string;
}
  
interface CycleWithPlantsAndSpace {
    id: number;
    name: string;
    start_date: string;
    space_id: number;
    plants: Plant[];
    spaces: SpaceInfo;
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cyclesData } = await supabase
    .from('cycles')
    .select(`
      *,
      spaces (id, name, type),
      plants (*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const activeCycles = (cyclesData || []) as unknown as CycleWithPlantsAndSpace[];
  
  const totalPlants = activeCycles.reduce((acc, cycle) => acc + (cycle.plants?.length || 0), 0);
  const totalCycles = activeCycles.length;

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      
      <GlobalHeader userEmail={user?.email} title="Panel de Control" />

      <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-title font-light text-white">
            Hola, <span className="font-medium">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-body">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
      </div>

      {/* --- GRID DE MÉTRICAS (KPIs) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* KPI 1: Plantas */}
        <div className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 font-body">Plantas Activas</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-title font-light text-white group-hover:text-brand-primary transition-colors">{totalPlants}</span>
            <Leaf className="text-brand-primary w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
        </div>

        {/* KPI 2: Ciclos */}
        <div className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 font-body">Ciclos en Curso</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-title font-light text-white group-hover:text-brand-primary transition-colors">{totalCycles}</span>
            <RefreshCw className="text-blue-500 w-8 h-8 opacity-80 group-hover:rotate-180 transition-transform duration-700" strokeWidth={1.5} />
          </div>
        </div>

        {/* KPI 3: Agenda */}
        <Link href="/calendar" className="bg-brand-primary/10 p-5 rounded-2xl border border-brand-primary/20 hover:bg-brand-primary/20 transition-all cursor-pointer group">
          <p className="text-[10px] uppercase tracking-widest text-brand-primary font-bold mb-2 font-body">Agenda</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-medium text-emerald-100 font-body">Calendario</span>
            <CalendarDays className="text-brand-primary w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
        </Link>
        
        {/* KPI 4: Espacios */}
        <Link href="/spaces" className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 font-body">Infraestructura</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-medium text-slate-300 font-body">Mis Espacios</span>
            <Warehouse className="text-slate-400 w-8 h-8 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </div>
        </Link>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CICLOS ACTIVOS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium font-title text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
              Laboratorio Activo
            </h2>
            <Link href="/cycles" className="text-xs text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-wide font-body flex items-center gap-1">
              Ver Todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeCycles.length > 0 ? (
            activeCycles.map((cycle) => {
               const daysDiff = Math.floor((new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24));
               
               return (
                <div key={cycle.id} className="group relative bg-[#12141C] rounded-3xl p-6 border border-white/5 hover:border-brand-primary/30 transition-all duration-300 overflow-hidden">
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase font-body">
                          {cycle.spaces?.name}
                        </span>
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
                      Entrar al Lab <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="relative z-10">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-3 font-body">Plantas ({cycle.plants?.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {cycle.plants?.slice(0, 6).map(plant => (
                        <div key={plant.id} className="flex items-center gap-2 bg-[#0B0C10] border border-white/10 rounded-full pr-3 pl-1 py-1">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                             {/* Icono pequeño de planta */}
                             <Leaf className="w-3 h-3" />
                          </div>
                          <span className="text-xs text-slate-300 font-body">{plant.name}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                             plant.stage === 'Floración' ? 'bg-purple-500' : 'bg-brand-primary'
                          }`}></span>
                        </div>
                      ))}
                      {cycle.plants && cycle.plants.length > 6 && (
                        <span className="text-xs text-slate-500 self-center ml-2 font-body">+{cycle.plants.length - 6} más</span>
                      )}
                    </div>
                  </div>
                </div>
               );
            })
          ) : (
            <div className="bg-[#12141C] rounded-3xl p-10 text-center border border-dashed border-white/10">
              <p className="text-slate-500 mb-4 font-body">No hay ciclos activos en este momento.</p>
              <Link href="/cycles" className="text-brand-primary hover:underline font-body font-bold">Iniciar un nuevo ciclo</Link>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: AGENDA */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-white font-title">Agenda</h2>
          </div>
          <div className="bg-[#12141C] rounded-3xl p-1 border border-white/5 h-full min-h-[300px]">
             <TasksCard />
          </div>
        </div>

      </div>
    </main>
  );
}