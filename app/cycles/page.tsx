import { createClient } from "@/app/lib/supabase-server"; // <--- Cliente seguro
import Link from "next/link";
import AddCycleModal from "@/components/AddCycleModal";
import CycleCard from "@/components/CycleCard";
import UserMenu from "@/components/UserMenu"; // <--- Importar
import GlobalHeader from "@/components/GlobalHeader";

export default async function CyclesPage() {
  const supabase = await createClient();

  // 1. USUARIO
  const { data: { user } } = await supabase.auth.getUser();

  // 2. CICLOS (Join)
  const { data: cycles } = await supabase
    .from('cycles')
    .select('*, spaces(name)')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-20 p-4">
         <GlobalHeader title="Ficha Técnica" />
      </div>
      
      {/* BARRA DE ACCIÓN */}
      <div className="flex justify-end mb-6">
          <AddCycleModal />
      </div>

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