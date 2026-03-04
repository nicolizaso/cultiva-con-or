import { createClient } from "@/app/lib/supabase-server";
import CalendarView from "@/components/CalendarView";
import GlobalHeader from "@/components/GlobalHeader";
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
      .select(`*, description, cycles(id, name), task_cycles(cycles(id, name)), task_plants(plants(name, cycle_id, cycles(id, name)))`)
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

  const viewCycles = cycles.map(c => ({ id: c.id, name: c.name }));
  const mappedTasks = (tasks || []).map((t: any) => {
    const cycleIdsSet = new Set<number>();
    const cycleNamesSet = new Set<string>();

    if (t.task_cycles && t.task_cycles.length > 0) {
        t.task_cycles.forEach((tc: any) => {
            if (tc.cycles) {
                cycleIdsSet.add(tc.cycles.id);
                cycleNamesSet.add(tc.cycles.name);
            }
        });
    }

    if (t.task_plants && t.task_plants.length > 0) {
        t.task_plants.forEach((tp: any) => {
            if (tp.plants?.cycles) {
                cycleIdsSet.add(tp.plants.cycles.id);
                cycleNamesSet.add(tp.plants.cycles.name);
            }
        });
    }

    // Legacy fallback
    if (t.cycle_id) {
        cycleIdsSet.add(t.cycle_id);
    }
    if (t.cycles) {
        cycleNamesSet.add(t.cycles.name);
    }

    const cycleIds = Array.from(cycleIdsSet);
    const cycleNames = Array.from(cycleNamesSet).join(', ');

    return {
      ...t,
      cycleIds,
      cycleNames
    };
  });

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      <GlobalHeader userEmail={user?.email} title="Agenda" subtitle="Planificación" />

      <CalendarView
        logs={logs || []}
        tasks={mappedTasks}
        plants={allPlants}
        spaces={allSpaces || []}
        cycles={viewCycles}
      />
    </main>
  );
}
