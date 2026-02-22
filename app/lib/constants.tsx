import {
  Droplets, FlaskConical, ShieldAlert, Shovel, Scissors, Activity,
  ArrowRightLeft, ArrowRightCircle, CloudRain, Flower, Skull, PenTool,
  Calendar, Sprout
} from 'lucide-react';
import React from 'react';

export const TASK_TYPES = [
  { id: 'riego', label: 'Riego', icon: Droplets, color: 'text-[#00a599]', border: 'border-[#00a599]/30', bg: 'bg-[#00a599]/10' },
  { id: 'fertilizante', label: 'Fertilizante', icon: FlaskConical, color: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  { id: 'repelente', label: 'Repelente', icon: ShieldAlert, color: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  { id: 'trasplante', label: 'Trasplante', icon: Shovel, color: 'text-amber-700', border: 'border-amber-700/30', bg: 'bg-amber-700/10' },
  { id: 'poda', label: 'Poda', icon: Scissors, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
  { id: 'entrenamiento', label: 'Entrenamiento', icon: Activity, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
  { id: 'ambiente', label: 'Cambiar Ambiente', icon: ArrowRightLeft, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
  { id: 'cambio_etapa', label: 'Cambio de Etapa', icon: ArrowRightCircle, color: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/10' },
  { id: 'lavado', label: 'Lavado de Raíces', icon: CloudRain, color: 'text-slate-500', border: 'border-slate-500/30', bg: 'bg-slate-500/10' },
  { id: 'cosechar', label: 'Cosechar', icon: Flower, color: 'text-violet-500', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  { id: 'muerta', label: 'Declarar Muerta', icon: Skull, color: 'text-white', border: 'border-white/30', bg: 'bg-black' },
  { id: 'otro', label: 'Otro', icon: PenTool, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
];

export function getTaskIcon(type: string) {
  const normalizedType = type?.toLowerCase();
  const taskType = TASK_TYPES.find(t => t.id === normalizedType);

  if (taskType) {
    return <taskType.icon size={16} />;
  }

  // Fallbacks
  if (normalizedType === 'log') return <Sprout size={16} />;
  if (normalizedType === 'image') return <Sprout size={16} />; // Or a camera icon if available

  return <Calendar size={16} />;
}
