import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import SpaceCard from "@/components/SpaceCard";
import AddSpaceModal from "@/components/AddSpaceModal";
import { Space } from "@/app/lib/types";

export default async function SpacesPage() {
  // Traemos todos los espacios ordenados por los más nuevos
  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-brand-bg p-6 text-brand-text pb-24">
      
      {/* HEADER con Navegación */}
      <header className="mb-8 flex justify-between items-center">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="text-brand-muted hover:text-brand-primary transition-colors text-sm">
                    ← Volver al Inicio
                </Link>
            </div>
            <h1 className="text-3xl font-title text-white uppercase tracking-wider">
              Mis Espacios
            </h1>
            <p className="text-brand-muted font-body text-sm">
              Administra tus armarios y patios
            </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-card border border-brand-primary flex items-center justify-center text-brand-primary font-bold">
          U
        </div>
      </header>

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