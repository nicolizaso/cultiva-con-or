import { describe, it } from "node:test";
import assert from "node:assert";
import { groupPlants } from "./plant-grouping.ts";
import type { Plant } from "./types.ts";

function createMockPlant(id: number, name: string): Plant {
  return {
    id,
    name,
    stage: 'Vegetativo',
    last_water: '',
    cycle_id: 1,
    // Add other required fields with dummy values if needed by type,
    // but Plant interface has many optionals.
  } as Plant;
}

describe("groupPlants", () => {
  it("should group consecutive numbered plants into a range", () => {
    const plants = [
      createMockPlant(1, "Cherry Crasher #1"),
      createMockPlant(2, "Cherry Crasher #2"),
      createMockPlant(3, "Cherry Crasher #3"),
      createMockPlant(4, "Cherry Crasher #4"),
      createMockPlant(5, "Cherry Crasher #5"),
      createMockPlant(6, "Cherry Crasher #6"),
      createMockPlant(7, "Cherry Crasher #7"),
      createMockPlant(8, "Cherry Crasher #8"),
      createMockPlant(9, "Cherry Crasher #9"),
    ];

    const result = groupPlants(plants);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].label, "Cherry Crasher #1-9");
    assert.strictEqual(result[0].count, 9);
  });

  it("should group identical unnumbered plants by count", () => {
    const plants = [
      createMockPlant(1, "Skywalker 2"),
      createMockPlant(2, "Skywalker 2"),
      createMockPlant(3, "Skywalker 2"),
    ];

    const result = groupPlants(plants);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].label, "Skywalker 2 x3");
    assert.strictEqual(result[0].count, 3);
  });

  it("should handle single unique plants", () => {
    const plants = [
      createMockPlant(1, "Amnesia"),
    ];

    const result = groupPlants(plants);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].label, "Amnesia");
    assert.strictEqual(result[0].count, 1);
  });

  it("should handle multiple groups (numbered and unnumbered)", () => {
    const plants = [
      createMockPlant(1, "Cherry Crasher #1"),
      createMockPlant(2, "Cherry Crasher #2"),
      createMockPlant(3, "Cherry Crasher #3"),
      createMockPlant(4, "White Widow #1"),
      createMockPlant(5, "White Widow #2"),
      createMockPlant(6, "White Widow #3"),
      createMockPlant(7, "Amnesia"), // Single
    ];

    const result = groupPlants(plants);
    // Sort result by label to ensure deterministic order for assertion
    result.sort((a, b) => a.label.localeCompare(b.label));

    assert.strictEqual(result.length, 3);

    // Amnesia
    const amnesia = result.find(r => r.label.includes("Amnesia"));
    assert.ok(amnesia);
    assert.strictEqual(amnesia.count, 1);

    // Cherry Crasher
    const cc = result.find(r => r.label.includes("Cherry Crasher"));
    assert.ok(cc);
    assert.strictEqual(cc.label, "Cherry Crasher #1-3");
    assert.strictEqual(cc.count, 3);

    // White Widow
    const ww = result.find(r => r.label.includes("White Widow"));
    assert.ok(ww);
    assert.strictEqual(ww.label, "White Widow #1-3");
    assert.strictEqual(ww.count, 3);
  });

  it("should handle gaps in numbered sequences", () => {
    const plants = [
      createMockPlant(1, "A #1"),
      createMockPlant(3, "A #3"), // Gap of 2
    ];

    const result = groupPlants(plants);
    assert.strictEqual(result.length, 2);
    // Should be two singles
    const labels = result.map(r => r.label).sort();
    assert.deepStrictEqual(labels, ["A #1", "A #3"]);
  });

  it("should handle mixed numbered and unnumbered of same base name", () => {
    const plants = [
      createMockPlant(1, "Amnesia #1"),
      createMockPlant(2, "Amnesia #2"),
      createMockPlant(3, "Amnesia"),
    ];

    const result = groupPlants(plants);
    // Should be Range #1-2 and Single "Amnesia"
    assert.strictEqual(result.length, 2);

    const range = result.find(r => r.label === "Amnesia #1-2");
    const single = result.find(r => r.label === "Amnesia");

    assert.ok(range, "Range not found");
    assert.ok(single, "Single not found");
  });

  it("should separate different base names that look similar", () => {
     const plants = [
      createMockPlant(1, "Amnesia #1"),
      createMockPlant(2, "Amnesia Auto #1"),
    ];
    const result = groupPlants(plants);
    assert.strictEqual(result.length, 2);
    const labels = result.map(r => r.label).sort();
    assert.deepStrictEqual(labels, ["Amnesia #1", "Amnesia Auto #1"]);
  });
});
