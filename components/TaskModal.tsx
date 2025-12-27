"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Calendar, Droplets, Scissors, Sprout, Wind, Trash2, CheckCircle2, Circle, AlertTriangle, Bug } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

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

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskSaved: () => void;
    initialData?: any; // Para edición
    cycles?: any[]; // Lista de ciclos para asignar
}

const TASK_TYPES: TaskType[] = [
    'Riego', 'Fertilizantes', 'Repelente', 'Trasplante', 'Poda',
    'Entrenamiento', 'Cambiar ambiente', 'Lavado de raíces', 'Cosechar',
    'Declarar muerta', 'Otro'
];

export default function TaskModal({ isOpen, onClose, onTaskSaved, initialData, cycles = [] }: TaskModalProps) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TaskType>('Otro');
    const [cycleId, setCycleId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDate(initialData.due_date ? initialData.due_date.split('T')[0] : new Date().toISOString().split('T')[0]);
            setType(initialData.type || 'Otro');
            setCycleId(initialData.cycle_id || null);
        } else {
            setTitle("");
            setDate(new Date().toISOString().split('T')[0]);
            setType('Otro');
            setCycleId(null);
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const taskData = {
            title,
            due_date: date,
            type, // Asumimos que la columna 'type' existe o se usará 'priority' como fallback si falla, pero el requerimiento pide este campo
            cycle_id: cycleId,
            is_completed: initialData?.is_completed || false,
            priority: 'medium' // Fallback
        };

        try {
            if (initialData) {
                // Update
                const { error } = await supabase
                    .from('tasks')
                    .update(taskData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('tasks')
                    .insert([taskData]);
                if (error) throw error;
            }
            onTaskSaved();
            onClose();
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Error al guardar la tarea. Verifica tu conexión.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#12141C] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
                    <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                        {initialData ? 'ID: ' + initialData.id : 'Creando...'}
                    </span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Titulo */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Título</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary/50 outline-none"
                            placeholder="Ej: Riego con fertilizante..."
                            required
                        />
                    </div>

                    {/* Fecha */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary/50 outline-none [color-scheme:dark]"
                            required
                        />
                    </div>

                    {/* Tipo */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Tipo de Actividad</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as TaskType)}
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary/50 outline-none appearance-none cursor-pointer"
                        >
                            {TASK_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ciclo Asociado */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Ciclo Asociado (Opcional)</label>
                        <select
                            value={cycleId || ""}
                            onChange={(e) => setCycleId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-brand-primary/50 outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Sin ciclo específico</option>
                            {cycles.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-primary hover:bg-[#008f85] text-[#0B0C10] font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
