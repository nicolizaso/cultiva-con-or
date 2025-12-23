import { createClient } from "@/app/lib/supabase-server";
import { notFound } from "next/navigation";
import CycleDetailView from "@/components/CycleDetailView";
import GlobalHeader from "@/components/GlobalHeader"; // <--- Importamos el Header nuevo

export default async function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. OBTENER USUARIO (Esto faltaba y causaba el error)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. OBTENER CICLO + ESPACIO
  const { data: cycle, error } = await supabase
    .from('cycles')
    .select(`
      *,
      spaces ( name, type )
    `)
    .eq('id', id)
    .single();

  if (error || !cycle) {
    return notFound();
  }

  // 3. OBTENER PLANTAS DEL CICLO
  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .eq('cycle_id', id)
    .order('id', { ascending: true });

  // 4. OBTENER LA ÚLTIMA MEDICIÓN DE CLIMA
  const { data: lastMeasurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('cycle_id', id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  // 5. OBTENER HISTORIAL (Para el gráfico)
  const { data: history } = await supabase
    .from('measurements')
    .select('*')
    .eq('cycle_id', id)
    .order('date', { ascending: true }) // Orden cronológico para el gráfico
    .limit(20);

  // Calcular días desde el inicio
  const daysDiff = Math.floor((new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <main className="min-h-screen bg-[#0B0C10] pb-24 text-slate-200 p-4 md:p-8">
      
      {/* HEADER GLOBAL INTEGRADO */}
      <GlobalHeader 
        userEmail={user?.email} 
        title="Panel de Ciclo"
        subtitle={cycle.name}
      />

      {/* --- HERO SECTION DEL CICLO --- */}
      <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 mb-8 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        cycle.is_active 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                        {cycle.is_active ? '🟢 Activo' : '🔴 Archivado'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {cycle.spaces?.type}
                    </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-light text-white mb-2">
                    {cycle.name}
                </h1>
                <p className="text-slate-500 text-lg flex items-center gap-2">
                    📍 {cycle.spaces?.name} <span className="text-slate-700">|</span> 🗓️ Día {daysDiff}
                </p>
            </div>

            {/* KPI Rápido */}
            <div className="flex gap-8 text-right bg-[#0B0C10]/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Plantas</p>
                    <p className="text-2xl font-light text-white">{plants?.length || 0}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Salud</p>
                    <p className="text-2xl font-light text-emerald-400">100%</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENIDO INTERACTIVO --- */}
      <CycleDetailView 
        cycle={cycle} 
        plants={plants || []} 
        lastMeasurement={lastMeasurement}
        history={history || []}
      />

    </main>
  );
}