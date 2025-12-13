"use client";

import { useState } from "react";
import AddTaskModal from "./AddTaskModal";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TasksCard() {
  // Por ahora usamos estado local, en el futuro vendrá de la base de datos
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleToggleTask = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: Date.now(), // ID temporal
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Filtrar tareas no completadas para mostrar solo las pendientes
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="bg-brand-card border border-[#333] rounded-xl overflow-hidden">
      {/* Header oscuro */}
      <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#333]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-subtitle text-white">Tareas</h2>
            <p className="text-sm text-brand-muted mt-1">¿Qué tengo que hacer ya?</p>
          </div>
          <AddTaskModal onAdd={handleAddTask} />
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-[#222] p-6">
        {pendingTasks.length === 0 ? (
          /* Empty State - Mensaje motivacional */
          <div className="text-center py-8">
            <div className="mb-4">
              <span className="text-5xl">🌱</span>
            </div>
            <p className="text-brand-muted text-sm leading-relaxed">
              No tenés tareas agendadas para hoy, aprovecha a observarlas y relajar🌱
            </p>
          </div>
        ) : (
          /* Lista de tareas checkeable */
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#252525] transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="mt-1 w-5 h-5 rounded border-[#333] bg-[#1a1a1a] text-brand-primary focus:ring-brand-primary focus:ring-2 cursor-pointer"
                />
                <label
                  className={`flex-1 text-sm text-white cursor-pointer ${
                    task.completed ? 'line-through text-brand-muted' : ''
                  }`}
                  onClick={() => handleToggleTask(task.id)}
                >
                  {task.title}
                </label>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-brand-muted hover:text-red-400 transition-opacity text-xs"
                  title="Eliminar tarea"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

