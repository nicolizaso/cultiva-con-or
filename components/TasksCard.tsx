"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Clock, Calendar } from "lucide-react";
import AddTaskModal from "./AddTaskModal";

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export default function TasksCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('completed', { ascending: true }) 
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const toggleTask = async (taskId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
    await supabase.from('tasks').update({ completed: newStatus }).eq('id', taskId);
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("¿Borrar tarea?")) return;
    setTasks(tasks.filter(t => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  const handleAddTask = async (title: string) => {
     const { data } = await supabase.from('tasks').insert([{ title, priority: 'medium', due_date: new Date().toISOString() }]).select();
     if(data) setTasks([...tasks, data[0]]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
         <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Pendientes</span>
         </div>
         <AddTaskModal onAdd={handleAddTask} />
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
        {tasks.length === 0 && !loading && (
            <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                <p className="text-slate-500 text-sm">No hay tareas pendientes.</p>
            </div>
        )}

        {tasks.map(task => (
          <div key={task.id} className={`group p-3 rounded-xl border transition-all ${task.completed ? 'bg-transparent border-transparent opacity-50' : 'bg-[#0B0C10] border-white/5 hover:border-brand-primary/30'}`}>
            <div className="flex items-start gap-3">
              <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5 text-slate-500 hover:text-brand-primary transition-colors">
                {task.completed ? <CheckCircle2 size={18} className="text-brand-primary" /> : <Circle size={18} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                </p>
                {expandedTask === task.id && task.description && (
                    <p className="text-xs text-slate-500 mt-2">{task.description}</p>
                )}
              </div>

              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-500/10 rounded text-slate-600 hover:text-red-400">
                    <Trash2 size={14} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}