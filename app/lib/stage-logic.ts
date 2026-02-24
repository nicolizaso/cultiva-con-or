import type { Plant } from "./types.ts";

// Thresholds configuration
export const STAGE_THRESHOLDS: Record<string, { nextStage: string; days: number }> = {
  'Germinación': { nextStage: 'Plántula', days: 7 },
  'Plántula': { nextStage: 'Vegetativo', days: 21 },
  'Enraizamiento': { nextStage: 'Vegetativo', days: 12 },
  'Vegetativo': { nextStage: 'Floración', days: 60 },
};

/**
 * Checks if a plant is ready to move to the next stage based on its age.
 * @param plant The plant to check
 * @param now Optional current date for testing
 * @returns The next stage name if a suggestion exists, null otherwise
 */
export function getStageSuggestion(plant: Plant, now: Date = new Date()): string | null {
  // Calculate age locally if planted_at is available, otherwise fall back to DB computed or static days
  let age = plant.current_age_days ?? plant.days ?? 0;

  if (plant.planted_at) {
    const planted = new Date(plant.planted_at);
    // Use the provided 'now' for better testability and avoid future dates issues
    const diffTime = now.getTime() - planted.getTime();
    age = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  const threshold = STAGE_THRESHOLDS[plant.stage];

  if (threshold && age >= threshold.days) {
    return threshold.nextStage;
  }

  return null;
}

/**
 * Finds the first plant that has a stage suggestion.
 * @param plants Array of plants to check
 * @param now Optional current date for testing
 * @returns An object with the plant and its next stage, or null if no suggestions
 */
export function getFirstSuggestion(plants: Plant[], now: Date = new Date()): { plant: Plant; nextStage: string } | null {
  for (const plant of plants) {
    const nextStage = getStageSuggestion(plant, now);
    if (nextStage) {
      return { plant, nextStage };
    }
  }
  return null;
}
