import PlantCard from  "../components/plantcard"
import { supabase } from "./lib/supabase"; 

// Hacemos el componente async para poder pedir datos al servidor
export default async function Home() {
  
  // 1. Pedimos las plantas a Supabase
  const { data: plants, error } = await supabase
    .from('plants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error cargando plantas:", error);
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8 text-slate-200">
      
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-emerald-500">MiCultivo 🌿</h1>
            <p className="text-slate-400">Resumen del Ciclo: Invierno 2024</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Nueva Planta
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* 2. Si hay plantas, las recorremos y mostramos */}
        {plants && plants.length > 0 ? (
            plants.map((planta) => (
            <PlantCard 
                key={planta.id} 
                id={planta.id} // <--- ¡AGREGA ESTA LÍNEA! (El carnet de identidad)
                name={planta.name}
                stage={planta.stage}
                days={planta.days}
                lastWater={planta.last_water}
            />
            ))
        ) : (
            /* Estado Vacío (Empty State) por si no hay datos */
            <div className="col-span-full text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                <p>🌱 No hay plantas activas. ¡Crea la primera!</p>
            </div>
        )}
        
      </section>

    </main>
  );
}