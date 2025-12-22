"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

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
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString() && !task.completed;
  });

  const upcomingTasks = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    const today = new Date();
    return taskDate.toDateString() !== today.toDateString() && !task.completed;
  });

  const completedTasks = tasks.filter(task => task.completed);

  if (loading) {
    return (
      <div className="bg-brand-card border border-[#333] rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-brand-card-hover rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-brand-card-hover rounded"></div>
          <div className="h-4 bg-brand-card-hover rounded w-5/6"></div>
          <div className="h-4 bg-brand-card-hover rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-[#333] rounded-2xl p-6">
      <h2 className="text-xl font-subtitle text-white mb-4">📋 Tareas</h2>
      
      {/* Tareas de hoy */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-brand-muted mb-3">Para hoy</h3>
        {todayTasks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-[#333] rounded-xl">
            <div className="text-4xl mb-2">🌱</div>
            <p className="text-brand-muted text-sm">
              No tenés tareas agendadas para hoy, aprovechá para observar tus plantas y relajarte.
            </p>
            <button 
              onClick={() => {
                const addButton = document.querySelector('button[title="Agregar tarea"]') as HTMLButtonElement;
                if (addButton) {
                  addButton.click();
                }
              }}
              className="mt-4 bg-brand-card border border-[#333] hover:bg-brand-card-hover text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 hover:border-brand-primary"
            >
              + Agregar tarea
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                expanded={expandedTask === task.id}
                onToggle={() => toggleTask(task.id, task.completed)}
                onDelete={() => deleteTask(task.id)}
                onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                formatDate={formatDate}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        )}
      </div>

      {/* Próximas tareas */}
      {upcomingTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-brand-muted mb-3">Próximas</h3>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                expanded={expandedTask === task.id}
                onToggle={() => toggleTask(task.id, task.completed)}
                onDelete={() => deleteTask(task.id)}
                onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                formatDate={formatDate}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tareas completadas */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-brand-muted mb-3">Completadas</h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                expanded={expandedTask === task.id}
                onToggle={() => toggleTask(task.id, task.completed)}
                onDelete={() => deleteTask(task.id)}
                onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                formatDate={formatDate}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente TaskItem separado para mejor organización
function TaskItem({ 
  task, 
  expanded, 
  onToggle, 
  onDelete, 
  onToggleExpand,
  formatDate,
  getPriorityColor,
  getPriorityIcon
}: {
  task: Task;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
  formatDate: (date: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-3 hover:bg-brand-card-hover transition-all duration-200">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed 
              ? 'bg-brand-primary border-brand-primary text-white' 
              : 'border-[#555] hover:border-brand-primary'
          }`}
        >
          {task.completed && <span className="text-xs">✓</span>}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${task.completed ? 'line-through text-brand-muted' : 'text-white'}`}>
                {task.title}
              </p>
              {task.description && expanded && (
                <p className="text-xs text-brand-muted mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                {task.priority}
              </span>
              <span className="text-xs text-brand-muted">
                {formatDate(task.due_date)}
              </span>
              <button
                onClick={onToggleExpand}
                className="text-brand-muted hover:text-white transition-colors duration-200"
              >
                <span className={`text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <button
                onClick={onDelete}
                className="text-brand-muted hover:text-red-500 transition-colors duration-200"
              >
                <span className="text-sm">🗑</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}