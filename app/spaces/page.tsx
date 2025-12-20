import { createClient } from "@/app/lib/supabase-server"; // <--- Cliente seguro
import Link from "next/link";
import SpaceCard from "@/components/SpaceCard";
import AddSpaceModal from "@/components/AddSpaceModal";
import UserMenu from "@/components/UserMenu"; // <--- El menú interactivo
import { Space } from "@/app/lib/types";

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
      
      {/* HEADER BLINDADO */}
      <header className="mb-8 flex justify-between items-center relative z-20">
        <div>
            <div className="mb-2">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-sm py-2 pr-4 font-bold"
                >
                    <span>←</span> VOLVER AL INICIO
                </Link>
            </div>
            
            <h1 className="text-3xl font-title text-white uppercase tracking-wider">
              Mis Espacios
            </h1>
            <p className="text-brand-muted font-body text-sm">
              Administra tus armarios y patios
            </p>
        </div>

        {/* REEMPLAZAMOS EL DIV "U" POR EL COMPONENTE REAL */}
        <UserMenu email={user?.email} />
        
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