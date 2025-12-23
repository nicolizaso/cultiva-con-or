"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase"; // Asegúrate de que este sea el cliente correcto (createBrowserClient)
import { CheckCircle2, Circle, Trash2, Clock, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";
import AddTaskModal from "./AddTaskModal";

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  is_completed: boolean; // <--- CAMBIO AQUÍ (antes 'completed')
}

export default function TasksCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        // CAMBIO AQUÍ: Ordenar por 'is_completed' en lugar de 'completed'
        .order('is_completed', { ascending: true }) 
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: number, currentStatus: boolean) => {
    // 1. Actualización optimista (UI primero)
    const newStatus = !currentStatus;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: newStatus } : t));

    // 2. Actualización en Base de Datos
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: newStatus }) // <--- CAMBIO AQUÍ
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      // Revertir si falla
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: currentStatus } : t));
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("¿Borrar tarea?")) return;
    
    // Optimistic delete
    setTasks(tasks.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      fetchTasks(); // Recargar si falla
    }
  };

  const handleAddTask = async (title: string) => {
     // Al insertar, Supabase pondrá 'is_completed' en false por defecto si así está configurada la tabla,
     // o podemos enviarlo explícitamente.
     const newTask = { 
        title, 
        priority: 'medium', 
        due_date: new Date().toISOString(),
        is_completed: false 
     };

     const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select();
     
     if(error) {
        console.error("Error creating task:", error);
        return;
     }

     if(data) {
        setTasks([...tasks, data[0] as Task]);
     }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <ArrowUpCircle size={12} className="text-red-400" />;
    if (priority === 'low') return <ArrowDownCircle size={12} className="text-blue-400" />;
    return <MinusCircle size={12} className="text-slate-400" />;
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
          <div key={task.id} className={`group p-3 rounded-xl border transition-all ${task.is_completed ? 'bg-transparent border-transparent opacity-50' : 'bg-[#0B0C10] border-white/5 hover:border-brand-primary/30'}`}>
            <div className="flex items-start gap-3">
              <button onClick={() => toggleTask(task.id, task.is_completed)} className="mt-0.5 text-slate-500 hover:text-brand-primary transition-colors">
                {task.is_completed ? <CheckCircle2 size={18} className="text-brand-primary" /> : <Circle size={18} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {task.title}
                </p>
                
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
                        {getPriorityIcon(task.priority)} {task.priority}
                    </span>
                </div>
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