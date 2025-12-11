import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import AddCycleModal from "@/components/AddCycleModal";
import CycleCard from "@/components/CycleCard";

export default async function CyclesPage() {
  // JOIN: Traemos ciclos y el nombre del espacio asociado
  // Sintaxis: select('*, spaces(name)')
  const { data: cycles } = await supabase
    .from('cycles')
    .select('*, spaces(name)')
    .order('is_active', { ascending: false }) // Activos primero
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24">
      
      {/* HEADER */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
        <a 
  href="/" 
  className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-sm py-2 pr-4 font-bold cursor-pointer relative z-50"
>
    <span>←</span> VOLVER AL INICIO
</a>
        </div>
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-title text-white uppercase tracking-wider">
                Mis Ciclos
                </h1>
                <p className="text-brand-muted font-body text-sm">
                Historial de temporadas y cultivos
                </p>
            </div>
            {/* Modal de Crear */}
            <AddCycleModal />
        </div>
      </header>

      {/* LISTA DE CICLOS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles && cycles.length > 0 ? (
          cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-brand-muted border-2 border-dashed border-[#333] rounded-xl bg-brand-card/30">
            <p className="mb-2">📅 No hay ciclos registrados.</p>
            <p className="text-xs">Crea una temporada para empezar a agregar plantas.</p>
          </div>
        )}
      </section>

    </main>
  );
}