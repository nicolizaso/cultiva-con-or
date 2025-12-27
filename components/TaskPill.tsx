"use client";

import { CheckCircle2, Circle, Trash2, Droplets, Scissors, Sprout, Wind, Bug, Skull, HelpCircle, Activity } from "lucide-react";

export type TaskType =
    | 'Riego'
    | 'Fertilizantes'
    | 'Repelente'
    | 'Trasplante'
    | 'Poda'
    | 'Entrenamiento'
    | 'Cambiar ambiente'
    | 'Lavado de raíces'
    | 'Cosechar'
    | 'Declarar muerta'
    | 'Otro';

interface TaskPillProps {
    task: {
        id: number;
        title: string;
        is_completed: boolean;
        type?: string;
        cycle_name?: string; // Nombre del ciclo para mostrar
    };
    onToggle: (id: number, status: boolean) => void;
    onDelete: (id: number) => void;
    onClick?: () => void;
}

const getTypeColor = (type?: string) => {
    switch (type) {
        case 'Riego': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'Fertilizantes': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'Poda': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'Trasplante': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'Cosechar': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'Bug': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
};

const getTypeIcon = (type?: string) => {
    switch (type) {
        case 'Riego': return <Droplets size={14} />;
        case 'Fertilizantes': return <Activity size={14} />;
        case 'Poda': return <Scissors size={14} />;
        case 'Trasplante': return <Sprout size={14} />;
        case 'Cosechar': return <Wind size={14} />; // Wind como algo de secado? Ojo
        case 'Repelente': return <Bug size={14} />;
        case 'Declarar muerta': return <Skull size={14} />;
        default: return <HelpCircle size={14} />;
    }
};

export default function TaskPill({ task, onToggle, onDelete, onClick }: TaskPillProps) {
    const colorClass = getTypeColor(task.type);

    return (
        <div
            className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                task.is_completed
                ? 'bg-[#0B0C10] border-white/5 opacity-60 grayscale'
                : `bg-[#0B0C10] border-white/10 hover:border-brand-primary/30 hover:bg-white/[0.02]`
            }`}
            onClick={onClick}
        >
            {/* Color Indicator Background (Optional subtle tint) */}
            <div className={`absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none ${colorClass.split(' ')[0].replace('/20', '/100')}`}></div>

            <div className="flex items-center gap-3 overflow-hidden">
                {/* Icono de Tipo */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colorClass}`}>
                    {getTypeIcon(task.type)}
                </div>

                <div className="min-w-0">
                    <h4 className={`text-sm font-medium truncate ${task.is_completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {task.title}
                    </h4>
                    {task.cycle_name && (
                        <p className="text-[10px] text-slate-500 truncate">
                            {task.cycle_name}
                        </p>
                    )}
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex items-center gap-1 pl-2" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onToggle(task.id, task.is_completed)}
                    className={`p-1.5 rounded-lg transition-colors ${
                        task.is_completed
                        ? 'text-brand-primary hover:bg-brand-primary/10'
                        : 'text-slate-600 hover:text-brand-primary hover:bg-brand-primary/10'
                    }`}
                >
                    {task.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 mobile-hover:opacity-100" // mobile-hover custom class if needed or just opacity-100 on mobile
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
