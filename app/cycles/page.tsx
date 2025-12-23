import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import AddCycleModal from "@/components/AddCycleModal";
import CycleCard from "@/components/CycleCard";
import GlobalHeader from "@/components/GlobalHeader";
import { RefreshCw } from "lucide-react";

export default async function CyclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cycles } = await supabase
    .from('cycles')
    .select('*, spaces(name)')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      
      <GlobalHeader userEmail={user?.email} title="Historial" subtitle="Ciclos de Cultivo" />
      
      <div className="flex justify-end mb-6">
          <AddCycleModal />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles && cycles.length > 0 ? (
          cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-[#12141C]">
            <RefreshCw className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-500">No hay ciclos registrados.</p>
          </div>
        )}
      </section>
    </main>
  );
}