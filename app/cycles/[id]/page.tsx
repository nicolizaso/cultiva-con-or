import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import CycleDetailView from "@/components/CycleDetailView";

export default async function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. OBTENER CICLO + ESPACIO
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

  // 2. OBTENER PLANTAS DEL CICLO
  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .eq('cycle_id', id)
    .order('id', { ascending: true }); // Orden por ID (lote)

  // 3. OBTENER LA ÚLTIMA MEDICIÓN DE CLIMA
  const { data: lastMeasurement } = await supabase
    .from('measurements')
    .select('*')
    .eq('cycle_id', id)
    .order('date', { ascending: false })      // Prioridad a la fecha del registro
    .order('created_at', { ascending: false }) // Desempate por hora de creación real
    .limit(1)
    .single();

  // Calcular días
  const daysDiff = Math.floor((new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <main className="min-h-screen bg-brand-bg pb-24">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-[#111] border-b border-[#333] pt-8 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-brand-muted mb-4 uppercase tracking-wider">
                <Link href="/" className="hover:text-brand-primary">Inicio</Link> 
                <span>/</span>
                <Link href="/cycles" className="hover:text-brand-primary">Ciclos</Link>
                <span>/</span>
                <span className="text-white">Panel de Control</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-3 py-1 rounded text-xs font-bold uppercase">
                            {cycle.is_active ? '🟢 Activo' : '🔴 Archivado'}
                        </span>
                        <span className="bg-[#222] text-gray-400 border border-[#333] px-3 py-1 rounded text-xs font-bold uppercase">
                            {cycle.spaces?.type}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-title text-white uppercase mb-2">
                        {cycle.name}
                    </h1>
                    <p className="text-brand-muted text-lg flex items-center gap-2">
                        📍 {cycle.spaces?.name} <span className="text-[#333]">|</span> 🗓️ Día {daysDiff}
                    </p>
                </div>

                {/* KPI Rápido */}
                <div className="flex gap-8 text-right">
                    <div>
                        <p className="text-xs text-brand-muted uppercase font-bold">Plantas</p>
                        <p className="text-3xl font-title text-white">{plants?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-xs text-brand-muted uppercase font-bold">Salud</p>
                        <p className="text-3xl font-title text-green-400">100%</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENIDO INTERACTIVO --- */}
      <div className="max-w-6xl mx-auto p-6">
        <CycleDetailView 
          cycle={cycle} 
          plants={plants || []} 
          lastMeasurement={lastMeasurement}
        />
      </div>

    </main>
  );
}