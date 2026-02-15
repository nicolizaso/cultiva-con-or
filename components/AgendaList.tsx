'use client'

import { Task } from "@/app/lib/types"
import TaskPill from "./TaskPill"
import { toggleTaskStatus } from "@/app/actions/tasks"
import { useToast } from "@/app/context/ToastContext"
import { CheckCircle2 } from "lucide-react"

interface AgendaListProps {
  tasks: Task[]
}

export default function AgendaList({ tasks }: AgendaListProps) {
  const { showToast } = useToast()

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const res = await toggleTaskStatus(id, newStatus)

    if (res?.error) {
      showToast('Error al actualizar estado', 'error')
    } else {
      showToast(newStatus === 'completed' ? '¡Tarea completada!' : 'Tarea marcada como pendiente', 'success')
    }
  }

  // Ordenar: Pendientes primero, luego completadas.
  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    if (a.status === b.status) return 0
    return a.status === 'pending' ? -1 : 1
  })

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-60">
        <CheckCircle2 size={32} className="text-brand-primary mb-2" />
        <span className="text-sm text-slate-400 font-medium">No hay tareas para hoy</span>
      </div>
    )
  }

  return (
    <div className="space-y-2 pr-2">
      {sortedTasks.map((task) => (
        <TaskPill
          key={task.id}
          task={task}
          onComplete={handleToggle}
        />
      ))}
    </div>
  )
}
