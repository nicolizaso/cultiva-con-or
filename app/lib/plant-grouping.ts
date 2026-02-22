import type { Plant } from "./types.ts";

export interface GroupedPlant {
  id: string; // Unique key for rendering
  label: string; // The text to display (e.g. "Cherry Crasher #1-9" or "Amnesia x4")
  count: number; // Number of plants in this group
  href: string; // Link destination
  baseName: string; // For potential filtering/styling
}

/**
 * Groups a list of plants based on naming conventions.
 *
 * Rules:
 * 1. Numbered Range: "Name #1", "Name #2" -> "Name #1-2" (if consecutive)
 * 2. Identical Name: "Name", "Name" -> "Name x2"
 * 3. Single: "Name" -> "Name"
 */
export function groupPlants(plants: Plant[]): GroupedPlant[] {
  if (!plants || plants.length === 0) return [];

  const grouped: GroupedPlant[] = [];

  // Helper to extract base name and number
  // Pattern: "Name #123" -> base="Name", number=123
  // Pattern: "Name" -> base="Name", number=null
  const parseName = (name: string) => {
    const match = name.match(/^(.*?)\s+#(\d+)$/);
    if (match) {
      return { base: match[1].trim(), number: parseInt(match[2], 10), isNumbered: true };
    }
    return { base: name.trim(), number: null, isNumbered: false };
  };

  // 1. Bucket by Base Name
  const buckets = new Map<string, Plant[]>();

  plants.forEach(plant => {
    const { base } = parseName(plant.name);
    if (!buckets.has(base)) {
      buckets.set(base, []);
    }
    buckets.get(base)!.push(plant);
  });

  // 2. Process each bucket
  buckets.forEach((bucketPlants, baseName) => {
    // Separate into Numbered and Unnumbered (or duplicate names treated as unnumbered)
    const numbered: { plant: Plant; number: number }[] = [];
    const unnumbered: Plant[] = [];

    bucketPlants.forEach(p => {
      const { number, isNumbered } = parseName(p.name);
      if (isNumbered && number !== null) {
        numbered.push({ plant: p, number });
      } else {
        unnumbered.push(p);
      }
    });

    // --- Process Numbered Plants (Rule 1) ---
    // Sort by number
    numbered.sort((a, b) => a.number - b.number);

    if (numbered.length > 0) {
      // Find consecutive ranges
      let rangeStart = numbered[0];
      let rangeEnd = numbered[0];
      let currentCount = 1;

      for (let i = 1; i < numbered.length; i++) {
        const current = numbered[i];
        const previous = numbered[i - 1];

        // Check continuity
        if (current.number === previous.number + 1) {
          // Continuous
          rangeEnd = current;
          currentCount++;
        } else {
          // Gap detected, finalize previous range
          if (currentCount > 1) {
            grouped.push({
              id: `${baseName}-range-${rangeStart.number}-${rangeEnd.number}`,
              label: `${baseName} #${rangeStart.number}-${rangeEnd.number}`,
              count: currentCount,
              href: `/plants?search=${encodeURIComponent(baseName)}`,
              baseName
            });
          } else {
            // Single numbered item
            grouped.push({
              id: `plant-${rangeStart.plant.id}`,
              label: rangeStart.plant.name, // e.g. "Name #5"
              count: 1,
              href: `/plants/${rangeStart.plant.id}`,
              baseName
            });
          }

          // Reset range
          rangeStart = current;
          rangeEnd = current;
          currentCount = 1;
        }
      }

      // Finalize last range
      if (currentCount > 1) {
        grouped.push({
          id: `${baseName}-range-${rangeStart.number}-${rangeEnd.number}`,
          label: `${baseName} #${rangeStart.number}-${rangeEnd.number}`,
          count: currentCount,
          href: `/plants?search=${encodeURIComponent(baseName)}`,
          baseName
        });
      } else {
        grouped.push({
          id: `plant-${rangeStart.plant.id}`,
          label: rangeStart.plant.name,
          count: 1,
          href: `/plants/${rangeStart.plant.id}`,
          baseName
        });
      }
    }

    // --- Process Unnumbered/Identical Plants (Rule 3) ---
    if (unnumbered.length > 0) {
       // Since they all share the same base name (by definition of the bucket logic for unnumbered),
       // we can just count them all together.

       if (unnumbered.length > 1) {
         grouped.push({
           id: `${baseName}-x${unnumbered.length}`,
           label: `${baseName} x${unnumbered.length}`,
           count: unnumbered.length,
           href: `/plants?search=${encodeURIComponent(baseName)}`,
           baseName
         });
       } else {
         // Single unnumbered item (Rule 4)
         const p = unnumbered[0];
         grouped.push({
           id: `plant-${p.id}`,
           label: p.name,
           count: 1,
           href: `/plants/${p.id}`,
           baseName
         });
       }
    }
  });

  return grouped;
}
