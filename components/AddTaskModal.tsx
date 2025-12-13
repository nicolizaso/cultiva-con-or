"use client";

import { useState } from "react";

interface AddTaskModalProps {
  onAdd: (title: string) => void;
}

export default function AddTaskModal({ onAdd }: AddTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) {
      return;
    }

    setLoading(true);
    
    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      onAdd(taskTitle.trim());
      setTaskTitle("");
      setIsOpen(false);
      setLoading(false);
    }, 200);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-colors shrink-0"
        title="Agregar nueva tarea"
      >
        + Nueva
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative bg-brand-card w-full max-w-md rounded-xl border border-[#333] shadow-2xl p-6 animate-in zoom-in duration-200">
            <h2 className="text-xl font-subtitle text-white mb-4">Nueva Tarea</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-brand-muted mb-2 text-xs font-bold uppercase">
                  Descripción de la tarea
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ej: Regar con Fertilizante de Flora"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setTaskTitle("");
                  }}
                  className="flex-1 py-3 text-brand-muted hover:text-white font-bold text-xs uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !taskTitle.trim()}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg py-3 rounded-lg font-title tracking-wide transition disabled:opacity-50"
                >
                  {loading ? "AGREGANDO..." : "AGREGAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

