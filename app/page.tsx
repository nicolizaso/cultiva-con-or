import { supabase } from "./lib/supabase";
import PlantCard from "@/components/plantcard";
import AddPlantModal from "@/components/AddPlantModal";
import Link from "next/link";
import { Plant } from "./lib/types";

// Definimos un tipo extendido para incluir las plantas dentro del ciclo
interface CycleWithPlants {
  id: number;
  name: string;
  start_date: string;
  space_id: number;
  plants: Plant[]; // <--- El array de plantas viene anidado
}

export default async function Home() {
  // 1. LA CONSULTA MAESTRA (JOIN)
  // "Dame todos los ciclos activos, y para cada uno, dame todas sus plantas (ordenadas por fecha)"
  const { data: cycles } = await supabase
    .from('cycles')
    .select(`
      *,
      plants (*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Forzamos el tipado porque Supabase a veces retorna tipos complejos en Joins
  const activeCycles = (cycles || []) as unknown as CycleWithPlants[];

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24">
      
      {/* HEADER */}
      <header className="mb-8 flex justify-between items-center relative z-20">
        <div>
            <h1 className="text-3xl font-title text-brand-primary uppercase tracking-wider">
              Ojitos Rojos <span className="text-white">Tracker</span>
            </h1>
            <div className="flex gap-2 mt-2">
                <Link 
                  href="/spaces" 
                  className="text-[10px] font-bold text-brand-muted border border-[#333] px-3 py-1 rounded-full hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  ⚙️ ESPACIOS
                </Link>
                <Link 
                  href="/cycles" 
                  className="text-[10px] font-bold text-brand-muted border border-[#333] px-3 py-1 rounded-full hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  🔄 CICLOS
                </Link>
            </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-primary flex items-center justify-center text-brand-primary font-bold shrink-0">
          U
        </div>
      </header>

      {/* RENDERIZADO DE CICLOS */}
      {activeCycles.length > 0 ? (
        <div className="space-y-12"> {/* Espacio entre ciclos distintos */}
          
          {activeCycles.map((cycle) => {
            // Calculamos días para ESTE ciclo específico
            const daysDiff = Math.floor((new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <section key={cycle.id} className="border-t border-[#333] pt-6 first:border-0 first:pt-0">
                
                {/* CABECERA DEL CICLO (Hero Mini) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-subtitle text-white">{cycle.name}</h2>
                      <span className="text-xs font-bold bg-brand-primary/20 text-brand-primary px-2 py-1 rounded border border-brand-primary/20">
                        Día {daysDiff}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted mt-1">
                      {cycle.plants.length} plantas en seguimiento
                    </p>
                  </div>

                  {/* Botón de Agregar específico para ESTE ciclo */}
                  <div className="shrink-0">
                    <AddPlantModal 
                      cycleId={cycle.id} 
                      cycleName={cycle.name} 
                    />
                  </div>
                </div>

                {/* GRILLA DE PLANTAS DE ESTE CICLO */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {cycle.plants && cycle.plants.length > 0 ? (
                    // Ordenamos las plantas en JS para asegurar que las nuevas salgan primero
                    cycle.plants
                      .sort((a, b) => b.id - a.id) 
                      .map((planta) => (
                        <PlantCard 
                          key={planta.id} 
                          id={planta.id}
                          name={planta.name}
                          stage={planta.stage}
                          days={planta.days}
                          lastWater={planta.last_water}
                          imageUrl={(planta as any).image_url} // Cast rápido por si types no está 100% sync
                        />
                    ))
                  ) : (
                    // EMPTY STATE LOCAL (Solo para este ciclo)
                    <div className="col-span-full py-8 text-center border border-dashed border-[#333] rounded-lg bg-brand-card/20">
                      <p className="text-sm text-brand-muted">🌱 No hay plantas en este ciclo todavía.</p>
                    </div>
                  )}
                </div>

              </section>
            );
          })}

        </div>
      ) : (
        /* EMPTY STATE GLOBAL (Sin ningún ciclo) */
        <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🍂
          </div>
          <h2 className="text-2xl font-subtitle text-white mb-2">Todo está muy tranquilo...</h2>
          <p className="text-brand-muted mb-6 max-w-md mx-auto">
            No tienes ningún ciclo activo. Ve a la sección de Ciclos para comenzar una nueva temporada o reactivar una anterior.
          </p>
          <Link href="/cycles" className="inline-block bg-brand-primary hover:bg-brand-primary-hover text-brand-bg px-8 py-3 rounded-lg font-title tracking-wide transition-colors">
            COMENZAR CULTIVO
          </Link>
        </div>
      )}

    </main>
  );
}