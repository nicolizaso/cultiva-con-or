import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import CalendarWidget from "@/components/CalendarWidget";
import GlobalHeader from "@/components/GlobalHeader";
import DashboardFab from "@/components/DashboardFab";
import { Plant } from "../lib/types";

export const dynamic = 'force-dynamic';

interface CycleWithPlantsAndSpace {
    id: number;
    name: string;
    start_date: string;
    space_id: number;
    plants: Plant[];
    spaces: { id: number, name: string };
}

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel fetch of all needed data
  const [
    { data: logs },
    { data: tasks },
    { data: activeCycles },
    { data: allSpaces }
  ] = await Promise.all([
    supabase
      .from('logs')
      .select(`*, plants ( name )`)
      .order('created_at', { ascending: true }),
    supabase
      .from('tasks')
      .select(`*, description, plants ( name )`)
      .order('due_date', { ascending: true }),
    supabase
      .from('cycles')
      .select(`*, spaces (id, name, type), plants (*, current_age_days, days_in_stage)`)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('spaces')
      .select('id, name')
  ]);

  // Process plants for the FAB (extracted from active cycles)
  const cycles = (activeCycles || []) as unknown as CycleWithPlantsAndSpace[];
  const allPlantsMap = new Map<string, { id: string, name: string }>();
  cycles.forEach(cycle => {
    cycle.plants?.forEach(p => {
      if (!allPlantsMap.has(String(p.id))) {
        allPlantsMap.set(String(p.id), { id: String(p.id), name: p.name });
      }
    });
  });
  const allPlants = Array.from(allPlantsMap.values());

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      <GlobalHeader userEmail={user?.email} title="Agenda" subtitle="Planificación" />
      <div className="max-w-6xl mx-auto">
        <CalendarWidget logs={logs || []} tasks={tasks || []} />
      </div>

      <DashboardFab
        plants={allPlants}
        spaces={allSpaces || []}
      />
    </main>
  );
}
