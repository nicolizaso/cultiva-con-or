import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import LogModal from "@/components/LogModal";
import EditPlantModal from "@/components/EditPlantModal";
import GlobalHeader from "@/components/GlobalHeader";

// 1. CAMBIO AQUÍ: Definimos params como una Promise
export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 2. CAMBIO AQUÍ: Esperamos (await) a que los parámetros lleguen
  const { id } = await params;
  const plantId = id; // Ahora sí podemos usarlo

  // 1. OBTENER DATOS DE LA PLANTA
  const { data: plant, error } = await supabase
    .from('plants')
    .select(`
      *,
      cycles ( name )
    `)
    .eq('id', plantId)
    .single();

  if (error || !plant) {
    return notFound();
  }

  // 2. OBTENER LOS LOGS
  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-brand-bg pb-20">

      <div className="absolute top-0 left-0 w-full z-20 p-4">
         <GlobalHeader title="Ficha Técnica" />
      </div>
      
      {/* --- HERO SECTION (Portada) --- */}
      <div className="relative h-64 md:h-80 w-full bg-[#111]">
        {plant.image_url ? (
          <Image 
            src={plant.image_url} 
            alt={plant.name}
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-brand-muted text-6xl">
            🌿
          </div>
        )}
        
        <div className="absolute inset-0 bg-linear-to-t from-brand-bg via-transparent to-transparent"></div>

        <Link href="/" className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all text-sm font-bold z-10">
          ← Volver
        </Link>

        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-brand-primary text-xs font-bold uppercase tracking-widest bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded mb-2 inline-block">
                {plant.stage}
              </span>
              <h1 className="text-4xl md:text-5xl font-title text-white uppercase shadow-black drop-shadow-lg">
                {plant.name}
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                Ciclo: <span className="text-white font-bold">{plant.cycles?.name}</span>
              </p>
            </div>
            
            <div className="mb-1 flex gap-2">
               <LogModal plantId={plant.id} plantName={plant.name} />
               <EditPlantModal plant={plant} />
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-3xl mx-auto p-6">
        
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-brand-card border border-[#333] p-4 rounded-xl text-center">
            <p className="text-xs text-brand-muted uppercase">Edad</p>
            <p className="text-2xl font-title text-white">{plant.days} <span className="text-sm text-gray-500">días</span></p>
          </div>
          <div className="bg-brand-card border border-[#333] p-4 rounded-xl text-center">
            <p className="text-xs text-brand-muted uppercase">Riegos</p>
            <p className="text-2xl font-title text-white">--</p>
          </div>
          <div className="bg-brand-card border border-[#333] p-4 rounded-xl text-center">
            <p className="text-xs text-brand-muted uppercase">Salud</p>
            <p className="text-2xl font-title text-green-400">100%</p>
          </div>
        </div>

        <h2 className="text-xl font-subtitle text-white mb-6 flex items-center gap-2">
          📜 Bitácora de Cultivo
        </h2>

        <div className="space-y-8 relative border-l-2 border-[#333] ml-3 pl-8">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative group">
                <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-brand-card border-2 border-brand-primary z-10 group-hover:scale-125 transition-transform"></div>

                <div className="bg-brand-card border border-[#333] rounded-xl p-5 hover:border-brand-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block mb-1">
                            {new Date(log.created_at).toLocaleDateString()}
                        </span>
                        <h3 className="text-lg font-bold text-white">{log.title}</h3>
                    </div>
                    <span className="text-2xl">
                        {log.type === 'Foto' ? '📸' : log.type === 'Riego' ? '💧' : '📝'}
                    </span>
                  </div>
                  
                  {log.notes && (
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                        {log.notes}
                    </p>
                  )}

                  {log.media_url && log.media_url.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {log.media_url.map((url: string, index: number) => (
                            <div key={index} className="relative h-40 w-full rounded-lg overflow-hidden border border-[#444]">
                                <Image 
                                    src={url} 
                                    alt="Evidencia" 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#1a1a1a] p-8 rounded-xl text-center border border-dashed border-[#333]">
                <p className="text-brand-muted">No hay registros en la bitácora aún.</p>
                <p className="text-xs text-gray-500 mt-2">¡Sube la primera foto para inaugurar el diario!</p>
            </div>
          )}
        </div>
          
      </div>
    </main>
  );
}