import { createClient } from "@/app/lib/supabase-server";
import GlobalHeader from "@/components/GlobalHeader";
import PlantsGridManager from "@/components/PlantsGridManager";
import AddPlantModal from "@/components/AddPlantModal";

export default async function PlantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plants } = await supabase
    .from('plants')
    .select(`
      *,
      current_age_days,
      days_in_stage,
      cycles ( name )
    `)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      
      <GlobalHeader 
        userEmail={user?.email} 
        title="Inventario Global" 
        subtitle="Todas las muestras"
      />

      <div className="flex justify-end mb-6">
        <AddPlantModal />
      </div>

      <PlantsGridManager plants={plants as any[] || []} />

    </main>
  );
}
