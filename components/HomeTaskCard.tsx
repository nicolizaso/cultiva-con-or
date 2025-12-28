'use client'

import { Task } from "@/app/lib/types"
import TaskPill from "./TaskPill"
import { completeTask } from "@/app/actions/tasks"
import { CalendarDays, CheckCircle2 } from "lucide-react"
import { useToast } from "@/app/context/ToastContext"

export default function HomeTaskCard({ task }: { task: Task | undefined }) {
  const { showToast } = useToast()

  const handleComplete = async (id: string) => {
    const res = await completeTask(id)
    if (res?.error) {
      showToast('Error al completar', 'error')
    } else {
      showToast('¡Tarea completada!', 'success')
    }
  }

  return (
    // Fondo VERDE (Brand Primary) como pediste
    <div className="bg-brand-primary/10 p-5 rounded-2xl border border-brand-primary/20 hover:bg-brand-primary/20 transition-all group flex flex-col h-full relative">
       
       <div className="flex justify-between items-start mb-2">
          {/* Título GRIS CLARO para contrastar o Brand Primary según prefieras (dejé brand para consistencia con fondo) */}
          <p className="text-[10px] uppercase tracking-widest text-brand-primary font-bold font-body">Tareas para hoy</p>
          <CalendarDays className="text-brand-primary w-5 h-5" strokeWidth={1.5} />
       </div>

       <div className="flex-1 flex items-end">
         {task ? (
           <div className="w-full">
             <TaskPill
               task={task}
               onComplete={handleComplete}
               // La píldora ya maneja sus propios colores internos
             />
           </div>
         ) : (
           <div className="w-full flex flex-col items-center justify-center opacity-60">
             <CheckCircle2 size={24} className="text-brand-primary mb-1" />
             <span className="text-xs text-brand-primary/80 font-medium">¡Todo listo por hoy!</span>
           </div>
         )}
       </div>
    </div>
  )
}