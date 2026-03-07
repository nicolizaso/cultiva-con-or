import { Plant } from './types';
import { Dna } from 'lucide-react';

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) return dateString;

  // Use es-ES locale for dd/mm/yy format
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

export function getStageColor(stage?: string) {
  const s = stage?.toLowerCase() || '';

  if (s === 'floración' || s === 'floracion') {
    return {
      bgColor: 'bg-purple-200/20',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-200/30',
      icon: '🌸'
    };
  }

  if (s === 'vegetativo' || s === 'vegetacion') {
    return {
      bgColor: 'bg-green-200/20',
      textColor: 'text-green-300',
      borderColor: 'border-green-200/30',
      icon: '🌿'
    };
  }

  if (s === 'enraizamiento') {
    return {
      bgColor: 'bg-cyan-200/20',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-200/30',
      icon: <Dna className="w-[1em] h-[1em]" />
    };
  }

  if (s === 'plántula' || s === 'plantula' || s === 'esqueje') {
    return {
      bgColor: 'bg-cyan-200/20',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-200/30',
      icon: '🌱'
    };
  }

  if (s === 'germinación' || s === 'germinacion') {
    return {
      bgColor: 'bg-yellow-200/20',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-200/30',
      icon: '💧'
    };
  }

  if (s === 'secado') {
    return {
      bgColor: 'bg-orange-200/20',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-200/30',
      icon: '🍂'
    };
  }

  if (s === 'curado') {
    return {
      bgColor: 'bg-red-200/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-200/30',
      icon: '🍯'
    };
  }

  // Default fallback
  return {
    bgColor: 'bg-slate-200/10',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-200/30',
    icon: '❓'
  };
}

export function getPlantMetrics(plant: Plant) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Order matters: prioritize later stages
  const stages = [
    { key: 'date_curado', label: 'Curado' },
    { key: 'date_secado', label: 'Secado' },
    { key: 'date_floracion', label: 'Floración' },
    { key: 'date_vegetativo', label: 'Vegetativo' },
    { key: 'date_enraizamiento', label: 'Enraizamiento' },
    { key: 'date_plantula', label: 'Plántula' },
    { key: 'date_germinacion', label: 'Germinación' }
  ];

  let currentStage = plant.stage; // Default to existing stage if no dates found
  let stageDate: Date | null = null;

  // 1. Determine Current Stage based on highest date set
  for (const stage of stages) {
    // @ts-ignore
    const dateStr = plant[stage.key];
    if (dateStr) {
      currentStage = stage.label;
      stageDate = new Date(dateStr);
      break;
    }
  }

  // If no stage date found but planted_at exists, maybe fallback logic?
  // For now, if no date found, we stick with plant.stage but have no start date.

  // 2. Calculate Days in Current Stage
  let daysInCurrentStage = 0;
  if (stageDate) {
      // normalize
      const d = new Date(stageDate);
      d.setHours(0,0,0,0);
      const diffTime = today.getTime() - d.getTime();
      daysInCurrentStage = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // 3. Calculate Total Age (from earliest date available)
  let earliestDate: Date | null = null;
  const allDates = [
      plant.date_germinacion,
      plant.date_plantula,
      plant.date_enraizamiento,
      plant.date_vegetativo,
      plant.date_floracion,
      plant.date_secado,
      plant.date_curado,
      plant.planted_at
  ].filter(d => d).map(d => new Date(d as string));

  if (allDates.length > 0) {
      allDates.sort((a, b) => a.getTime() - b.getTime());
      earliestDate = allDates[0];
  }

  let totalAge = 0;
  if (earliestDate) {
      const e = new Date(earliestDate);
      e.setHours(0,0,0,0);
      const diffTime = today.getTime() - e.getTime();
      totalAge = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return {
      currentStage,
      daysInCurrentStage,
      totalAge
  };
}

export function mapTaskCycles(t: any, allCycles?: { id: number; name: string }[]): { cycleIds: number[], cycleNames: string } {
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
        if (allCycles) {
            const matchingCycle = allCycles.find((c: any) => c.id === t.cycle_id);
            if (matchingCycle) cycleNamesSet.add(matchingCycle.name);
        } else if (t.cycles && typeof t.cycles === 'object') {
            cycleNamesSet.add(t.cycles.name);
        }
    }

    return {
      cycleIds: Array.from(cycleIdsSet),
      cycleNames: Array.from(cycleNamesSet).join(', ')
    };
}
