"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Eye, Home, Sprout, LayoutGrid, Calendar as CalendarIcon, ArrowRight, CheckCircle2, Trash2 } from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import TaskPill from "@/components/TaskPill";
import TaskModal, { TaskType } from "@/components/TaskModal";
import CycleCard from "@/components/CycleCard";
import { supabase } from "@/app/lib/supabase";

// Definición de tipos para la página
interface Task {
    id: number;
    title: string;
    due_date: string;
    is_completed: boolean;
    type?: string;
    cycle_id?: number;
    cycle_name?: string;
}

interface Cycle {
    id: number;
    name: string;
    start_date: string;
    stage: string;
    days: number;
    stage_days: number;
    plant_name: string;
    plant_id: number;
    next_task?: Task | null;
}

interface Space {
    id: number;
    name: string;
    active_cycles: number;
}

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");

    // Modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            updateGreeting(user?.user_metadata?.username);
            await Promise.all([fetchTasks(), fetchCycles(), fetchSpaces()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const updateGreeting = (username?: string) => {
        const hour = new Date().getHours();
        let text = "Buenas noches";
        if (hour < 12) text = "Buenos días";
        else if (hour < 20) text = "Buenas tardes";

        setGreeting(`${text}, ${username || "@usuario"}`);
    };

    const fetchTasks = async () => {
        const today = new Date().toISOString().split('T')[0];
        // Fetch tasks for today
        const { data, error } = await supabase
            .from('tasks')
            .select('*, cycles(name)') // Assuming relation
            .eq('due_date', today)
            .order('is_completed', { ascending: true }); // Pendientes primero

        if (data) {
            const formatted = data.map((t: any) => ({
                ...t,
                cycle_name: t.cycles?.name
            }));
            setTasks(formatted);
        }
    };

    const fetchCycles = async () => {
        // Mock data logic or fetch from real tables
        // Como no tengo la lógica de "etapas" en DB, voy a simularla o leer lo que haya
        // Asumo que hay tablas 'cycles' y 'plants'
        const { data: cyclesData } = await supabase.from('cycles').select('*, plants(*)').eq('is_active', true);
        
        if (cyclesData) {
            // Transformar a formato CycleCard
            const transformed = cyclesData.map((c: any) => {
                const startDate = new Date(c.start_date);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Lógica simple de etapa basada en días (fallback)
                let stage = "Vegetativo";
                let stageDays = diffDays;
                if(diffDays < 7) stage = "Germinación";
                else if(diffDays < 21) stage = "Plántula";
                else if(diffDays > 60) stage = "Floración";

                const plant = c.plants && c.plants.length > 0 ? c.plants[0] : { name: 'Sin planta', id: 0 };

                return {
                    id: c.id,
                    name: c.name,
                    start_date: c.start_date,
                    stage: stage,
                    days: diffDays,
                    stage_days: stageDays, // Simplificación
                    plant_name: plant.name,
                    plant_id: plant.id,
                    next_task: null // Se podría cruzar con tasks
                };
            });
            // Orden cronológico (más antiguo primero)
            transformed.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
            setCycles(transformed);
        }
    };

    const fetchSpaces = async () => {
        // Simulamos espacios activos si no hay tabla
        const { data } = await supabase.from('spaces').select('*');
        if(data) {
            // Count active cycles logic if needed
            const spacesWithCount = data.map((s: any) => ({
                ...s,
                active_cycles: 1 // Mock
            }));
            setSpaces(spacesWithCount);
        }
    };

    const handleToggleTask = async (id: number, status: boolean) => {
         // Optimistic
         setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !status } : t));
         await supabase.from('tasks').update({ is_completed: !status }).eq('id', id);
    };

    const handleDeleteTask = async (id: number) => {
        if(!confirm("¿Borrar tarea?")) return;
        setTasks(tasks.filter(t => t.id !== id));
        await supabase.from('tasks').delete().eq('id', id);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-[#0B0C10] font-body text-slate-200 pb-20">
            {/* FAB */}
            <button
                onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
                className="fixed bottom-24 right-6 z-40 bg-brand-primary text-[#0B0C10] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(0,165,153,0.4)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>

            <div className="max-w-md mx-auto px-[25px]">

                {/* Header & Greeting */}
                <GlobalHeader userEmail={user?.email} />

                <div className="mb-6">
                    <h2 className="text-xl font-light text-white">{greeting}</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Top Cards Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    
                    {/* 1. Tareas para hoy */}
                    <div className="col-span-2 bg-[#12141C] border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-title font-bold text-white text-lg">Tareas para hoy</h3>
                            <Link href="/agenda" className="text-xs text-brand-primary font-bold hover:underline">VER AGENDA</Link>
                        </div>

                        <div className="space-y-2 relative z-10">
                            {loading ? (
                                <p className="text-xs text-slate-600 animate-pulse">Cargando...</p>
                            ) : tasks.length > 0 ? (
                                <>
                                    {tasks.slice(0, 2).map(task => (
                                        <div key={task.id} className="w-full">
                                            <TaskPill
                                                task={task}
                                                onToggle={handleToggleTask}
                                                onDelete={handleDeleteTask}
                                                onClick={() => handleEditTask(task)}
                                            />
                                        </div>
                                    ))}
                                    {tasks.length > 2 && (
                                        <Link href="/agenda" className="block text-center text-xs text-slate-500 hover:text-white py-1">
                                            + {tasks.length - 2} más...
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-2 flex flex-col items-center gap-2 opacity-50">
                                    <Eye size={24} className="text-slate-600" />
                                    <p className="text-xs text-slate-500">
                                        No tenés nada agendado para hoy.<br/>
                                        <span className="opacity-70">Aprovechá a prender uno y relajar.</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Ciclos Activos (Botón) */}
                    <Link href="/ciclos" className="bg-[#12141C] border border-white/5 rounded-3xl p-5 shadow-lg flex flex-col justify-between group hover:border-brand-primary/30 transition-all h-32">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary group-hover:scale-110 transition-transform">
                                <Sprout size={20} />
                            </div>
                            <span className="text-2xl font-bold text-white">{cycles.length}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Mis Ciclos</p>
                            <p className="text-[10px] text-slate-500">Ver laboratorio</p>
                        </div>
                    </Link>

                    {/* 3. Mis Espacios */}
                    <div className="bg-[#12141C] border border-white/5 rounded-3xl p-5 shadow-lg flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <Home size={20} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-white">Mis Espacios</p>
                            <div className="flex gap-1 mt-1 overflow-x-auto no-scrollbar">
                                {spaces.length > 0 ? spaces.slice(0, 3).map(s => (
                                    <Link key={s.id} href={`/espacios/${s.id}`} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] hover:bg-white/20 transition-colors border border-white/5">
                                        {s.name[0]}
                                    </Link>
                                )) : <span className="text-[10px] text-slate-500">Sin espacios</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ciclos Activos Feed */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="font-title font-bold text-white text-xl">Ciclos Activos</h3>
                        {cycles.length === 0 && (
                            <Link href="/ciclos?new=true" className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1">
                                <Plus size={14} /> INICIAR UNO
                            </Link>
                        )}
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-40 bg-[#12141C] rounded-3xl animate-pulse"></div>
                        ) : cycles.length > 0 ? (
                            cycles.map(cycle => (
                                <CycleCard key={cycle.id} cycle={cycle} />
                            ))
                        ) : (
                            <button onClick={() => setIsTaskModalOpen(true)} className="w-full py-10 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:bg-white/5 hover:border-white/20 transition-all group">
                                <div className="p-4 bg-[#12141C] rounded-full group-hover:scale-110 transition-transform">
                                    <Sprout size={32} className="text-slate-600 group-hover:text-brand-primary" />
                                </div>
                                <p className="text-sm">No tenés ningún ciclo activo.</p>
                                <span className="text-xs font-bold text-brand-primary">Iniciá uno presionando acá</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Modal de Nueva/Editar Tarea */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => { setIsTaskModalOpen(false); setEditingTask(undefined); }}
                onTaskSaved={fetchTasks}
                initialData={editingTask}
                cycles={cycles}
            />
        </main>
    );
}
