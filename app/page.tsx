import { createClient } from "@/app/lib/supabase-server"; // ✅ Este lee cookiesimport PlantCard from "@/components/plantcard";
import AddPlantModal from "@/components/AddPlantModal";
import CycleStatusCard from "@/components/CycleStatusCard";
import UserMenu from "@/components/UserMenu"; // <--- NUEVO IMPORT
import Link from "next/link";
import { Plant } from "./lib/types";
import PlantCard from "@/components/plantcard";

// ... (Interfaces SpaceInfo y CycleWithPlantsAndSpace siguen igual) ...
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
  // 1. OBTENER USUARIO ACTUAL (Para el menú)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. CONSULTA DE DATOS (Igual que antes)
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

  const spacesMap = new Map<number, { info: SpaceInfo; cycles: CycleWithPlantsAndSpace[] }>();

  activeCycles.forEach((cycle) => {
    if (!cycle.spaces) return; 

    if (!spacesMap.has(cycle.space_id)) {
      spacesMap.set(cycle.space_id, {
        info: cycle.spaces,
        cycles: [],
      });
    }
    spacesMap.get(cycle.space_id)?.cycles.push(cycle);
  });

  const spacesGroups = Array.from(spacesMap.values());

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24">
      
      {/* HEADER PRINCIPAL */}
      <header className="mb-10 flex justify-between items-center relative z-20">
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
        
        {/* AQUÍ ESTÁ EL CAMBIO: MENÚ DE USUARIO */}
        <UserMenu email={user?.email} />

      </header>

      {/* RENDERIZADO POR ESPACIOS (El resto sigue igual...) */}
      {spacesGroups.length > 0 ? (
        <div className="space-y-16">
          {spacesGroups.map((group) => (
            <section key={group.info.id} className="relative">
              
              <div className="flex items-center gap-3 mb-6 border-l-4 border-brand-primary pl-4">
                <h2 className="text-3xl font-title text-white uppercase">
                  {group.info.name}
                </h2>
                <span className="text-xs font-bold bg-[#222] text-brand-muted px-2 py-1 rounded border border-[#333] uppercase">
                  {group.info.type}
                </span>
              </div>

              <CycleStatusCard cycles={group.cycles} />

              <div className="mt-8 space-y-10 pl-0 md:pl-4 border-l-0 md:border-l border-[#222]">
                {group.cycles.map((cycle) => {
                  const daysDiff = Math.floor((new Date().getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={cycle.id}>
                      <div className="flex flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-subtitle text-white">{cycle.name}</h3>
                            <span className="text-xs font-bold text-brand-primary/80">
                              Día {daysDiff}
                            </span>
                          </div>
                          <p className="text-xs text-brand-muted mt-1">
                            {cycle.plants.length} plantas
                          </p>
                        </div>

                        <div className="shrink-0">
                          <AddPlantModal 
                            cycleId={cycle.id} 
                            cycleName={cycle.name} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cycle.plants && cycle.plants.length > 0 ? (
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
                                imageUrl={(planta as any).image_url} 
                              />
                          ))
                        ) : (
                          <div className="col-span-full py-6 text-center border border-dashed border-[#333] rounded-lg bg-brand-card/10">
                            <p className="text-xs text-brand-muted">🌱 No hay plantas registradas aún.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 animate-in fade-in zoom-in duration-500">
            {/* Empty state igual que antes... */}
             <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-6 text-5xl border border-[#333]">
            🪐
          </div>
          <h2 className="text-2xl font-subtitle text-white mb-2">Tu universo está vacío</h2>
          <p className="text-brand-muted mb-8 max-w-md mx-auto">
            Para ver el panel de control, necesitas tener al menos un Espacio con un Ciclo activo.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/spaces" className="bg-brand-card hover:bg-[#333] text-white border border-[#444] px-6 py-3 rounded-lg font-title tracking-wide transition-colors">
              1. CREAR ESPACIO
            </Link>
            <Link href="/cycles" className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg px-6 py-3 rounded-lg font-title tracking-wide transition-colors">
              2. INICIAR CICLO
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}