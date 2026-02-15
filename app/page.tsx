import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import GlobalHeader from "@/components/GlobalHeader";
import DashboardFab from "@/components/DashboardFab";
import HomeTaskCard from "@/components/HomeTaskCard";
import AgendaList from "@/components/AgendaList";
import { Plant, Task } from "./lib/types";
import { Leaf, RefreshCw, Warehouse, Sprout, Plus, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import StageSuggester from "@/components/StageSuggester";

interface SpaceInfo { id: number; name: string; type: string; }
interface CycleWithPlantsAndSpace {
    id: number;
    name: string;
    start_date: string;
    space_id: number;
    plants: Plant[];
    spaces: SpaceInfo;
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get yesterday's date to ensure we catch tasks regardless of timezone shifts
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA');

  // Parallel fetch of all independent dashboard data
  const [
    { data: profile },
    { data: cyclesData },
    { data: tasksData },
    { data: allSpaces }
  ] = await Promise.all([
    // Profile info
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single(),
    // Active cycles with plants and spaces info
    // Note: We explicitly select current_age_days (computed column)
    supabase
      .from('cycles')
      .select(`*, spaces (id, name, type), plants (*, current_age_days, days_in_stage)`)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    // Tasks (Both pending and completed, broader range to fix timezone issues)
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('due_date', yesterdayStr)
      .order('created_at', { ascending: true }),
    // All available spaces for the UI
    supabase
      .from('spaces')
      .select('id, name')
  ]);

  const username = profile?.username;

  const allTodayTasks = (tasksData || []) as Task[];

  // Procesamiento
  const activeCycles = (cyclesData || []) as unknown as CycleWithPlantsAndSpace[];
  const totalPlants = activeCycles.reduce((acc, cycle) => acc + (cycle.plants?.length || 0), 0);
  const totalCycles = activeCycles.length;
  
  const activeSpacesMap = new Map();
  activeCycles.forEach(c => {
    if (c.spaces) activeSpacesMap.set(c.spaces.id, c.spaces);
  });
  const activeSpacesCount = activeSpacesMap.size;
  const allPlants: { id: string, name: string }[] = [];
  activeCycles.forEach(cycle => {
    cycle.plants?.forEach(p => {
      allPlants.push({ id: String(p.id), name: p.name });
    });
  });

  // Flatten plants list for the suggester
  const flatPlantsList: Plant[] = activeCycles.flatMap(c => c.plants || []);

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 px-6 py-4 md:p-8 pb-24 font-body relative">
      
      <StageSuggester plants={flatPlantsList} />

      <GlobalHeader userEmail={user.email} title="Panel de Control" />

      {username && (
        <div className="mb-8 animate-in slide-in-from-top-2 duration-500">
            <h1 className="text-2xl md:text-3xl font-title font-light text-white tracking-wide uppercase">
              Hola, <span className="font-bold text-brand-primary">{username}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-body capitalize">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* TARJETA 1: Tareas para hoy */}
        <HomeTaskCard tasks={allTodayTasks} />
        
        {/* TARJETA 2: Ciclos (Condicional) */}
        {totalCycles > 0 ? (
          <Link href="/cycles" className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 font-body">Ciclos en Curso</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-title font-light text-white group-hover:text-brand-primary transition-colors">{totalCycles}</span>
              <RefreshCw className="text-blue-500 w-8 h-8 opacity-80 group-hover:rotate-180 transition-transform duration-700" strokeWidth={1.5} />
            </div>
          </Link>
        ) : (
          // SIMPLIFICADO: Link normal a /cycles sin query params
          <Link href="/cycles" className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group flex flex-col justify-center items-center text-center relative">
             <div className="bg-brand-primary/10 p-3 rounded-full mb-2 text-brand-primary group-hover:scale-110 transition-transform">
                <Plus size={24} strokeWidth={2.5} />
             </div>
             <p className="text-xs text-slate-400 leading-tight font-body">
                No tenés ningún ciclo activo.<br/>
                <span className="text-brand-primary font-bold">Iniciá uno presionando acá</span>
             </p>
          </Link>
        )}

        {/* TARJETA 3: Plantas Activas */}
        <div className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 font-body">Plantas Activas</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-title font-light text-white group-hover:text-brand-primary transition-colors">{totalPlants}</span>
            <Leaf className="text-brand-primary w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* TARJETA 4: Mis Espacios */}
        <Link href="/spaces" className="bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 font-body">Mis Espacios</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-4xl font-title font-light text-white group-hover:text-brand-primary transition-colors">
              {activeSpacesCount}
            </span>
            <Warehouse className="text-slate-400 w-8 h-8 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </div>
        </Link>
      </div>

      {/* --- FEED PRINCIPAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <Link href={`/cycles/${cycle.id}`} className="mt-4 md:mt-0 bg-white text-black px-6 py-2 rounded-full text-sm font-bold font-body hover:bg-brand-primary hover:text-white transition-all shadow-lg shadow-brand-primary/10 flex items-center gap-2">
                      Ver Ciclo <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-3 font-body">Plantas ({cycle.plants?.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {cycle.plants?.slice(0, 6).map(plant => (
                        <div key={plant.id} className="flex items-center gap-2 bg-[#0B0C10] border border-white/10 rounded-full pr-3 pl-1 py-1">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                             <Leaf className="w-3 h-3" />
                          </div>
                          <span className="text-xs text-slate-300 font-body">{plant.name}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${plant.stage === 'Floración' ? 'bg-purple-500' : 'bg-brand-primary'}`}></span>
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
            <div className="bg-[#12141C] rounded-3xl p-10 text-center border border-dashed border-white/10 flex flex-col items-center justify-center">
              <Sprout className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
              <p className="text-slate-500 mb-4 font-body">No hay ciclos activos en este momento.</p>
              <Link href="/cycles" className="text-brand-primary hover:underline font-body font-bold bg-brand-primary/10 px-4 py-2 rounded-lg">Iniciar un nuevo ciclo</Link>
            </div>
          )}
        </div>

        {/* Agenda Placeholder */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-white font-title">Agenda</h2>
          </div>
          <div className="bg-[#12141C] rounded-3xl p-4 border border-white/5 h-80 overflow-y-auto custom-scrollbar">
             <AgendaList tasks={allTodayTasks} />
          </div>
        </div>
      </div>

      <DashboardFab 
        plants={allPlants}
        spaces={allSpaces || []}
      />

    </main>
  );
}