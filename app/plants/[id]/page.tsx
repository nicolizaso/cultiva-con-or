import { createClient } from "@/app/lib/supabase-server";
import Image from "next/image";
import { notFound } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import LogModal from "@/components/LogModal";
import EditPlantModal from "@/components/EditPlantModal";
import { Calendar, Droplets, Ruler, History, Sprout } from "lucide-react";

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plant, error } = await supabase
    .from('plants')
    .select(`*, current_age_days, cycles ( name )`)
    .eq('id', id)
    .single();

  if (error || !plant) return notFound();

  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('plant_id', id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B0C10] pb-24 text-slate-200 p-4 md:p-8 font-body">
      
      <GlobalHeader userEmail={user?.email} title="Ficha Técnica" subtitle={plant.name} />

      {/* --- HERO SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Foto Principal */}
        <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden border border-white/5 bg-[#12141C] group">
          {plant.image_url ? (
            <Image src={plant.image_url} alt={plant.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-brand-primary opacity-20">
                <Sprout size={64} />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <EditPlantModal plant={plant} />
          </div>
        </div>

        {/* Datos Técnicos */}
        <div className="flex flex-col justify-center space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                        plant.stage === 'Floración' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                    }`}>
                        {plant.stage}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                        {plant.cycles?.name}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-title font-light text-white mb-4">{plant.name}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#12141C] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Edad</span>
                    </div>
                    <p className="text-2xl font-light text-white">{plant.current_age_days ?? plant.days ?? 0} <span className="text-sm text-slate-500">días</span></p>
                </div>
                <div className="bg-[#12141C] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <Droplets size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Riego</span>
                    </div>
                    <p className="text-xl font-light text-white truncate">{plant.last_water || '-'}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <LogModal plantId={plant.id} plantName={plant.name} />
            </div>
        </div>
      </div>

      {/* --- BITÁCORA (Timeline) --- */}
      <section className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <History className="text-brand-primary" size={20} />
            <h2 className="text-lg font-title text-white">Bitácora de Seguimiento</h2>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Icono Central */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#333] bg-[#0B0C10] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-brand-primary">
                  {log.type === 'Riego' ? <Droplets size={16} /> : <Sprout size={16} />}
                </div>
                
                {/* Tarjeta */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white text-sm">{log.title}</span>
                    <time className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        {new Date(log.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  {log.notes && <p className="text-slate-400 text-xs leading-relaxed mb-3">"{log.notes}"</p>}
                  
                  {log.media_url && log.media_url.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {log.media_url.map((url: string, i: number) => (
                            <div key={i} className="relative h-24 rounded-lg overflow-hidden border border-white/5">
                                <Image src={url} alt="Log" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
                <p className="text-slate-500 text-sm">Sin registros aún.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}