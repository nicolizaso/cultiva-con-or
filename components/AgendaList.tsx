'use client'

import { Task } from "@/app/lib/types"
import TaskPill from "./TaskPill"
import { completeTask } from "@/app/actions/tasks"
import { useToast } from "@/app/context/ToastContext"
import { CheckCircle2 } from "lucide-react"

interface AgendaListProps {
  tasks: Task[]
}

export default function AgendaList({ tasks }: AgendaListProps) {
  const { showToast } = useToast()

  const handleComplete = async (id: string) => {
    const res = await completeTask(id)
    if (res?.error) {
      showToast('Error al completar', 'error')
    } else {
      showToast('¡Tarea completada!', 'success')
    }
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-60">
        <CheckCircle2 size={32} className="text-brand-primary mb-2" />
        <span className="text-sm text-slate-400 font-medium">No hay tareas pendientes</span>
      </div>
    )
  }

  return (
    <div className="space-y-2 pr-2">
      {tasks.map((task) => (
        <TaskPill
          key={task.id}
          task={task}
          onComplete={handleComplete}
        />
      ))}
    </div>
  )
}
