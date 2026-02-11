"use client";

import { useState, useEffect } from "react";
import { getPlantMetrics } from "@/app/lib/utils";
import { Plant } from "@/app/lib/types";

interface PlantMetricsDisplayProps {
  plant: Plant;
  type: 'totalAge' | 'daysInCurrentStage';
}

export default function PlantMetricsDisplay({ plant, type }: PlantMetricsDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const metrics = getPlantMetrics(plant);
  const value = type === 'totalAge' ? metrics.totalAge : metrics.daysInCurrentStage;

  if (!isMounted) {
    return <span className="opacity-0">0</span>;
  }

  return <>{value}</>;
}
