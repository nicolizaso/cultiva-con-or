import PlantCard from "@/components/plantcard";
import { supabase } from "./lib/supabase";
import { Cycle, Plant } from "./lib/types";
import Link from "next/link"; // <--- 1. AGREGA ESTA LÍNEA (Para el enlace de "estado vacío")
import AddPlantModal from "@/components/AddPlantModal"; // <--- 2. AGREGA ESTA LÍNEA (Para el botón nuevo)
export default async function Home() {
  // 1. Buscamos el Ciclo Activo (El "Invierno 2024")
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('is_active', true)
    .single(); // .single() porque solo debería haber uno activo a la vez

  // 2. Buscamos las plantas, PERO solo las de este ciclo
  let plants: Plant[] = [];
  
  if (activeCycle) {
    const { data } = await supabase
      .from('plants')
      .select('*')
      .eq('cycle_id', activeCycle.id) // <--- El filtro mágico
      .order('created_at', { ascending: false });
      
    if (data) plants = data;
  }

  // 3. Calculamos días del ciclo (Fecha hoy - Fecha inicio)
  const daysDiff = activeCycle 
    ? Math.floor((new Date().getTime() - new Date(activeCycle.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24"> {/* pb-24 para dar espacio al scroll */}
      
      {/* HEADER SIMPLE */}
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-title text-brand-primary uppercase tracking-wider">
              Ojitos Rojos <span className="text-white">Tracker</span>
            </h1>
            <p className="text-brand-muted font-body text-sm">
              Panel de Control
            </p>
        </div>
        {/* Avatar ficticio de usuario */}
        <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-primary flex items-center justify-center text-brand-primary font-bold">
          U
        </div>
      </header>

      {activeCycle ? (
        <>
          {/* HERO CARD: RESUMEN DEL CICLO */}
          <section className="mb-8 bg-brand-card rounded-2xl p-6 border border-[#333] relative overflow-hidden shadow-xl">
            {/* Adorno de fondo (Brillo turquesa) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-brand-primary text-xs font-bold uppercase tracking-widest border border-brand-primary/30 px-2 py-1 rounded-md bg-brand-primary/5">
                    CICLO ACTIVO
                  </span>
                  <h2 className="text-3xl font-subtitle text-white mt-2">
                    {activeCycle.name}
                  </h2>
                </div>
                {/* Contador Gigante */}
                <div className="text-right">
                  <p className="text-5xl font-title text-white">{daysDiff}</p>
                  <p className="text-xs text-brand-muted uppercase tracking-wider">Días</p>
                </div>
              </div>
              <Link 
                href="/spaces" 
                className="text-xs font-bold text-brand-primary border border-brand-primary px-3 py-1 rounded-full hover:bg-brand-primary hover:text-brand-bg transition-colors ml-4"
              >
                ⚙️ GESTIONAR ESPACIOS
              </Link>

              {/* Barra de Progreso Ficticia (Visual) */}
              <div className="w-full bg-brand-bg h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-brand-primary h-full w-[40%] rounded-full shadow-[0_0_10px_#00a599]"></div>
              </div>
              <p className="text-xs text-brand-muted mt-2 text-right">Progreso estimado: 40%</p>
            </div>
          </section>

          {/* GRILLA DE PLANTAS */}
          <section>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-subtitle text-white">Mis Plantas</h3>
              
              {/* AQUÍ ESTABA EL LINK, AHORA PONEMOS EL MODAL */}
              {/* Le pasamos el ID del ciclo activo para que sepa dónde guardar */}
              <AddPlantModal 
                cycleId={activeCycle.id} 
                cycleName={activeCycle.name} 
              />
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plants && plants.length > 0 ? (
                  plants.map((planta) => (
                  <PlantCard 
                      key={planta.id} 
                      id={planta.id}
                      name={planta.name}
                      stage={planta.stage}
                      days={planta.days}
                      lastWater={planta.last_water}
                      imageUrl={planta.image_url}
                  />
                  ))
              ) : (
                <div className="col-span-full py-12 text-center text-brand-muted border-2 border-dashed border-[#333] rounded-xl bg-brand-card/30 flex flex-col items-center justify-center gap-4">
                <p>🌱 Este ciclo está vacío.</p>
                
                {/* Reutilizamos el MISMO modal. */}
                <AddPlantModal 
                  cycleId={activeCycle.id} 
                  cycleName={activeCycle.name} 
                />
            </div>
              )}
            </div>
          </section>
        </>
      ) : (
        /* EMPTY STATE: SI NO HAY CICLO ACTIVO */
        <div className="text-center py-20">
          <h2 className="text-2xl font-subtitle text-white mb-2">No tienes cultivos activos</h2>
          <p className="text-brand-muted mb-6">Crea un espacio y un ciclo para comenzar.</p>
          <button className="bg-brand-primary text-brand-bg px-6 py-3 rounded-lg font-title text-lg hover:bg-white transition-colors">
            CREAR PRIMER CICLO
          </button>
        </div>
      )}

    </main>
  );
}