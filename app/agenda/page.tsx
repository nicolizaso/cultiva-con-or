"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import TaskPill from "@/components/TaskPill";
import { supabase } from "@/app/lib/supabase";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AgendaPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const { data } = await supabase
            .from('tasks')
            .select('*, cycles(name)')
            .order('due_date', { ascending: true });

        if (data) {
             const formatted = data.map((t: any) => ({
                ...t,
                cycle_name: t.cycles?.name
            }));
            setTasks(formatted);
        }
    };

    // Calendar Generation Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Filter tasks for selected date
    const tasksForDay = tasks.filter(t => isSameDay(new Date(t.due_date), selectedDate));

    // Group tasks logic if needed (Requirement: Group by Cycle)
    // Here we just list them, visual grouping can be done by sorting or headers.
    // Let's sort by cycle_name first for grouping effect
    tasksForDay.sort((a, b) => (a.cycle_name || "").localeCompare(b.cycle_name || ""));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <main className="min-h-screen bg-[#0B0C10] font-body text-slate-200 pb-20 flex flex-col">
            <div className="max-w-md mx-auto px-[25px] w-full flex-1 flex flex-col">
                <GlobalHeader title="Agenda" subtitle={format(selectedDate, "dd 'de' MMMM", { locale: es })} />

                <div className="flex items-center mb-4">
                    <Link href="/" className="p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                {/* TAREAS DEL DÍA (Arriba) */}
                <div className="flex-1 min-h-[300px] mb-6">
                    <h3 className="font-title font-bold text-white text-lg mb-3">
                        Tareas para el {format(selectedDate, "eeee d", { locale: es })}
                    </h3>

                    <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-1 custom-scrollbar">
                        {tasksForDay.length > 0 ? (
                            tasksForDay.map(task => (
                                <TaskPill
                                    key={task.id}
                                    task={task}
                                    onToggle={async (id, status) => {
                                        // Update local state
                                        const newTasks = tasks.map(t => t.id === id ? { ...t, is_completed: !status } : t);
                                        setTasks(newTasks);
                                        await supabase.from('tasks').update({ is_completed: !status }).eq('id', id);
                                    }}
                                    onDelete={async (id) => {
                                         if(!confirm("¿Borrar?")) return;
                                         setTasks(tasks.filter(t => t.id !== id));
                                         await supabase.from('tasks').delete().eq('id', id);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="py-10 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                                <CalendarIcon size={24} className="mb-2 opacity-50" />
                                <p className="text-sm">Nada por aquí.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CALENDARIO (Abajo - Full Width) */}
                <div className="bg-[#12141C] border border-white/5 rounded-3xl p-4 shadow-lg pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                        <h2 className="font-bold text-white capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronRight size={20} /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                            <div key={day} className="text-[10px] font-bold text-slate-500">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map(day => {
                            const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day));
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border
                                        ${isSelected ? 'bg-brand-primary text-[#0B0C10] border-brand-primary' : 'bg-[#0B0C10] border-white/5 hover:border-white/20'}
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                    `}
                                >
                                    <span className={`text-xs font-bold ${isSelected ? 'text-[#0B0C10]' : 'text-slate-300'}`}>{format(day, 'd')}</span>

                                    {/* Dots/Pills Indicators (Max 3) */}
                                    <div className="flex gap-0.5 mt-1 h-1.5 justify-center flex-wrap px-1 w-full">
                                        {dayTasks.slice(0, 3).map((t, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${t.is_completed ? 'bg-slate-500' : (isSelected ? 'bg-[#0B0C10]' : 'bg-brand-primary')}`}
                                            ></div>
                                        ))}
                                        {dayTasks.length > 3 && <span className="text-[6px] leading-none text-slate-500">+</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </main>
    );
}
