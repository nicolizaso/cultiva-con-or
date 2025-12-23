import { createClient } from "@/app/lib/supabase-server"; // <--- Cliente seguro
import Link from "next/link";
import SpaceCard from "@/components/SpaceCard";
import AddSpaceModal from "@/components/AddSpaceModal";
import UserMenu from "@/components/UserMenu"; // <--- El menú interactivo
import { Space } from "@/app/lib/types";
import GlobalHeader from "@/components/GlobalHeader";

export default async function SpacesPage() {
  const supabase = await createClient();

  // 1. OBTENER USUARIO (Para el menú)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. OBTENER ESPACIOS (Ahora filtrados por RLS automáticamente)
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24">
      
      <GlobalHeader 
        userEmail={user?.email} 
        title="Panel de Control"
      />

      {/* BARRA DE ACCIÓN */}
      <div className="flex justify-end mb-6">
        <AddSpaceModal />
      </div>

      {/* LISTA DE ESPACIOS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces && spaces.length > 0 ? (
          spaces.map((space) => (
            <SpaceCard key={space.id} space={space as Space} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-brand-muted border-2 border-dashed border-[#333] rounded-xl bg-brand-card/30">
            <p className="mb-2">🏠 No tienes espacios configurados.</p>
            <p className="text-xs">Crea uno para empezar a organizar tus ciclos.</p>
          </div>
        )}
      </section>

    </main>
  );
}