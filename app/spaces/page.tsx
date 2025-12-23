import { createClient } from "@/app/lib/supabase-server";
import AddSpaceModal from "@/components/AddSpaceModal";
import UserMenu from "@/components/UserMenu"; 
import GlobalHeader from "@/components/GlobalHeader";
import { Warehouse, Tent, Sun, Trash2 } from "lucide-react";
import SpaceCard from "@/components/SpaceCard"; // Podríamos reescribirlo, pero usaremos el layout grid

export default async function SpacesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: spaces } = await supabase
    .from('spaces')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      
      <GlobalHeader userEmail={user?.email} title="Infraestructura" subtitle="Espacios" />

      <div className="flex justify-end mb-6">
        <AddSpaceModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces && spaces.length > 0 ? (
          spaces.map((space) => (
             // Renderizamos la card aquí inline para asegurar el estilo Bento, 
             // Ojo: SpaceCard tiene lógica de borrar, idealmente actualizarías SpaceCard.tsx también.
             // Para que no se rompa la lógica, usamos el SpaceCard existente pero lo envolvemos en el grid.
             <SpaceCard key={space.id} space={space} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-[#12141C]">
            <Warehouse className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-500">No hay espacios configurados.</p>
          </div>
        )}
      </div>
    </main>
  );
}