import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import Image from "next/image";
import GlobalHeader from "@/components/GlobalHeader";

export default async function PlantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plants } = await supabase
    .from('plants')
    .select(`
      *,
      cycles ( name )
    `)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      
      <GlobalHeader 
        userEmail={user?.email} 
        title="Inventario Global" 
        subtitle="Todas las muestras"
      />

      {/* Grid de Plantas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {plants && plants.length > 0 ? (
          plants.map((plant) => (
            <Link 
              key={plant.id} 
              href={`/plants/${plant.id}`}
              className="group bg-[#12141C] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all shadow-md hover:shadow-brand-primary/10"
            >
              {/* Imagen */}
              <div className="aspect-square relative bg-[#050608]">
                {plant.image_url ? (
                   <Image src={plant.image_url} alt={plant.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                   <div className="flex items-center justify-center h-full text-4xl">🌿</div>
                )}
                {/* Badge de Estado */}
                <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md border uppercase font-body ${
                        plant.stage === 'Floración' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                        : 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'
                    }`}>
                        {plant.stage}
                    </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-medium font-title truncate">{plant.name}</h3>
                <p className="text-xs text-slate-500 truncate font-body">Ciclo: {plant.cycles?.name}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs font-bold text-slate-400 font-body">{plant.days} días</span>
                    <span className="text-[10px] text-brand-primary uppercase tracking-wider font-bold group-hover:translate-x-1 transition-transform font-body">Ver ficha →</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-[#12141C] rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500 font-body">No hay plantas registradas en ningún ciclo.</p>
          </div>
        )}
      </div>

    </main>
  );
}