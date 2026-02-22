import { createClient } from "@/app/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import LogModal from "@/components/LogModal";
import PlantMetricsDisplay from "@/components/PlantMetricsDisplay";
import { formatDateShort, getPlantMetrics, getStageColor } from "@/app/lib/utils";
import { Calendar, Droplets, Ruler, History, Sprout, Edit } from "lucide-react";

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plant, error } = await supabase
    .from('plants')
    .select(`*, current_age_days, days_in_stage, cycles ( name )`)
    .eq('id', id)
    .single();

  if (error || !plant) return notFound();

  // Fetch logs for this plant OR bulk logs for its cycle
  let logsQuery = supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (plant.cycle_id) {
     logsQuery = logsQuery.or(`plant_id.eq.${id},and(cycle_id.eq.${plant.cycle_id},plant_id.is.null)`);
  } else {
     logsQuery = logsQuery.eq('plant_id', id);
  }

  // Fetch pending tasks: Space-based OR Plant-linked
  const spaceTasksQuery = supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .eq('space_id', plant.space_id);

  const linkedTasksQuery = supabase
    .from('tasks')
    .select('*, task_plants!inner(plant_id)')
    .eq('status', 'pending')
    .eq('task_plants.plant_id', id);

  const [logsResult, spaceTasksResult, linkedTasksResult] = await Promise.all([
    logsQuery,
    spaceTasksQuery,
    linkedTasksQuery
  ]);

  const logs = logsResult.data || [];
  const spaceTasks = spaceTasksResult.data || [];
  const linkedTasks = linkedTasksResult.data || [];

  // Deduplicate tasks
  const allTasks = [...spaceTasks, ...linkedTasks];
  const pendingTasks = Array.from(new Map(allTasks.map((t: any) => [t.id, t])).values());

  // Merge for timeline
  const timelineItems = [
    ...pendingTasks.map((task: any) => ({
      id: `task-${task.id}`,
      originalId: task.id,
      date: task.due_date,
      title: task.title,
      type: task.type,
      notes: task.description,
      isTask: true
    })),
    ...logs.map((log: any) => ({
      id: `log-${log.id}`,
      originalId: log.id,
      date: log.created_at,
      title: log.title,
      type: log.type,
      notes: log.notes,
      media_url: log.media_url,
      isTask: false
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { currentStage, daysInCurrentStage, totalAge } = getPlantMetrics(plant);
  const rawStage = currentStage || plant.stage;
  const displayStage = (rawStage === 'Esqueje' || rawStage === 'Plantula') ? 'Plántula' : rawStage;
  const stageInfo = getStageColor(displayStage);

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
            <Link
                href={`/plants/${plant.id}/edit`}
                className="bg-[#222] hover:bg-[#333] text-white p-2 rounded-lg border border-[#333] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
                <Edit size={14} /> Editar
            </Link>
          </div>
        </div>

        {/* Datos Técnicos */}
        <div className="flex flex-col justify-center space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${stageInfo.bgColor} ${stageInfo.textColor} ${stageInfo.borderColor}`}>
                            {stageInfo.icon} {displayStage}
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                            {plant.cycles?.name}
                        </span>
                    </div>
                    <LogModal plantId={plant.id} plantName={plant.name} />
                </div>
                <h1 className="text-4xl md:text-5xl font-title font-light text-white mb-4">{plant.name}</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#12141C] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Edad Total</span>
                    </div>
                    <p className="text-2xl font-light text-white"><PlantMetricsDisplay plant={plant} type="totalAge" /> <span className="text-sm text-slate-500">días</span></p>
                </div>
                <div className="bg-[#12141C] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <History size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">En Etapa</span>
                    </div>
                    <p className="text-2xl font-light text-white"><PlantMetricsDisplay plant={plant} type="daysInCurrentStage" /> <span className="text-sm text-slate-500">días</span></p>
                </div>
                <div className="bg-[#12141C] p-4 rounded-2xl border border-white/5 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <Droplets size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Riego</span>
                    </div>
                    <p className="text-xl font-light text-white truncate">{plant.last_water || '-'}</p>
                </div>
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
          {timelineItems && timelineItems.length > 0 ? (
            timelineItems.map((item) => (
              <div key={item.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${item.isTask ? 'opacity-90' : ''}`}>
                
                {/* Icono Central */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${item.isTask ? 'border-dashed border-slate-500 text-slate-400' : 'border-[#333] text-brand-primary'} bg-[#0B0C10] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  {item.type?.toLowerCase() === 'riego' ? <Droplets size={16} /> : (item.isTask ? <Calendar size={16} /> : <Sprout size={16} />)}
                </div>
                
                {/* Tarjeta */}
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#12141C] p-5 rounded-2xl border ${item.isTask ? 'border-dashed border-slate-700' : 'border-white/5'} hover:border-brand-primary/30 transition-colors shadow-lg`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.title}</span>
                      {item.isTask && <span className="text-[9px] uppercase font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Pendiente</span>}
                    </div>
                    <time className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        {formatDateShort(item.date)}
                    </time>
                  </div>
                  {item.notes && <p className="text-slate-400 text-xs leading-relaxed mb-3">"{item.notes}"</p>}
                  
                  {item.media_url && item.media_url.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {item.media_url.map((url: string, i: number) => (
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