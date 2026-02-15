'use client'

import { useState } from 'react'
import { Task } from "@/app/lib/types"
import TaskPill from "./TaskPill"
import EditTaskModal from "./EditTaskModal"
import { toggleTaskStatus, deleteTasks } from "@/app/actions/tasks"
import { useToast } from "@/app/context/ToastContext"
import { CheckCircle2, Trash2, X, Loader2 } from "lucide-react"

interface AgendaListProps {
  tasks: Task[]
  disableDateFilter?: boolean
}

export default function AgendaList({ tasks, disableDateFilter = false }: AgendaListProps) {
  const { showToast } = useToast()

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Filter tasks for today using local time
  const todayStr = new Date().toLocaleDateString('en-CA');
  const tasksToDisplay = disableDateFilter
    ? tasks
    : tasks.filter(t => t.due_date && t.due_date.split('T')[0] === todayStr);

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

  // --- Selection Logic ---

  const handleLongPress = (taskId: string) => {
     if (isSelectionMode) return
     setIsSelectionMode(true)
     setSelectedTasks(new Set([taskId]))
     // Haptic feedback
     if (typeof navigator !== 'undefined' && navigator.vibrate) {
       navigator.vibrate(50)
     }
  }

  const handleSelectionToggle = (id: string) => {
     const newSelected = new Set(selectedTasks)
     if (newSelected.has(id)) {
       newSelected.delete(id)
     } else {
       newSelected.add(id)
     }

     if (newSelected.size === 0) {
       setIsSelectionMode(false)
     }
     setSelectedTasks(newSelected)
  }

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedTasks(new Set())
  }

  const handleDeleteSelected = async () => {
    if (selectedTasks.size === 0) return

    // Simple confirm dialog
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedTasks.size} tarea(s)?`)) return

    setIsDeleting(true)
    const res = await deleteTasks(Array.from(selectedTasks))
    setIsDeleting(false)

    if (res?.error) {
      showToast('Error al eliminar tareas', 'error')
    } else {
      showToast('Tareas eliminadas correctamente', 'success')
      exitSelectionMode()
    }
  }

  // Ordenar: Pendientes primero, luego completadas.
  const sortedTasks = [...(tasksToDisplay || [])].sort((a, b) => {
    if (a.status === b.status) return 0
    return a.status === 'pending' ? -1 : 1
  })

  if (!tasksToDisplay || tasksToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-60">
        <CheckCircle2 size={32} className="text-brand-primary mb-2" />
        <span className="text-sm text-slate-400 font-medium">No hay tareas {disableDateFilter ? 'para esta fecha' : 'para hoy'}</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 pr-2 ${isSelectionMode ? 'pb-24' : ''}`}>
      {sortedTasks.map((task) => (
        <TaskPill
          key={task.id}
          task={task}
          onComplete={handleToggle} // Keep original prop for backward compat/button logic
          onEdit={(t) => setEditingTask(t)}

          // Selection Props
          selectionMode={isSelectionMode}
          isSelected={selectedTasks.has(task.id)}
          onLongPress={handleLongPress}
          onSelect={handleSelectionToggle}
          onClick={(t) => handleToggle(t.id)} // Used when NOT in selection mode
        />
      ))}

      {editingTask && (
        <EditTaskModal
           isOpen={!!editingTask}
           onClose={() => setEditingTask(null)}
           task={editingTask}
        />
      )}

      {/* Floating Action Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1A1C25] border border-white/10 shadow-xl rounded-2xl p-3 flex items-center justify-between z-[60] animate-in slide-in-from-bottom-5 fade-in duration-200">
           <div className="flex items-center gap-3 px-2">
              <div className="bg-brand-primary/20 text-brand-primary p-2 rounded-full">
                <CheckCircle2 size={20} />
              </div>
              <span className="font-bold text-white text-sm">{selectedTasks.size} seleccionada{selectedTasks.size !== 1 ? 's' : ''}</span>
           </div>

           <div className="flex items-center gap-2">
             <button
               onClick={exitSelectionMode}
               className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
               disabled={isDeleting}
             >
               <X size={20} />
             </button>
             <button
               onClick={handleDeleteSelected}
               disabled={isDeleting}
               className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
             >
               {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
             </button>
           </div>
        </div>
      )}
    </div>
  )
}
