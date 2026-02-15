'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Repeat } from 'lucide-react'
import { updateTask } from '@/app/actions/tasks'
import { Task } from '@/app/lib/types'
import { useToast } from '@/app/context/ToastContext'
import DatePicker from './DatePicker'
import { useRouter } from 'next/navigation'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
}

export default function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
  const { showToast } = useToast()
  const router = useRouter()

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  // Initial date state, updated in useEffect
  const [date, setDate] = useState(() => {
    return new Date(task.due_date).toLocaleDateString('en-CA')
  })

  const [scope, setScope] = useState<'single' | 'all_future'>('single')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && task) {
       setTitle(task.title)
       setDescription(task.description || '')
       // Ensure we get YYYY-MM-DD from the task date
       const d = new Date(task.due_date)
       setDate(d.toLocaleDateString('en-CA'))
       setScope('single')
    }
  }, [isOpen, task])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('El título es obligatorio', 'error')
      return
    }

    setIsSubmitting(true)

    // Prepare updates
    const updates = {
       title,
       description,
       date: `${date}T12:00:00` // Append noon to avoid timezone shifts
    }

    const result = await updateTask(task.id, updates, scope, task.recurrence_id)

    setIsSubmitting(false)

    if (result?.error) {
       showToast(result.error, 'error')
    } else {
       showToast('Tarea actualizada', 'success')
       router.refresh()
       onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#12141C] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-wide">Editar Tarea</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">

           {/* Title */}
           <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand-primary/50 transition-colors"
                placeholder="Nombre de la tarea"
              />
           </div>

           {/* Date */}
           <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Fecha</label>
              <DatePicker selectedDate={date} onChange={setDate} />
           </div>

           {/* Description */}
           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Detalles</label>
             <textarea
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               rows={3}
               className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand-primary/50 transition-colors resize-none"
               placeholder="Notas adicionales..."
             />
           </div>

           {/* Recurrence Scope */}
           {task.recurrence_id && (
             <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-brand-primary">
                   <Repeat size={18} />
                   <span className="text-sm font-bold">Serie Recurrente</span>
                </div>
                <p className="text-xs text-slate-400">Esta tarea es parte de una serie. ¿Cómo quieres aplicar los cambios?</p>

                <div className="space-y-2">
                   <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${scope === 'single' ? 'bg-brand-primary/20 border-brand-primary/50' : 'bg-[#0B0C10] border-white/10 hover:border-white/20'}`}>
                      <input
                        type="radio"
                        name="scope"
                        value="single"
                        checked={scope === 'single'}
                        onChange={() => setScope('single')}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${scope === 'single' ? 'border-brand-primary' : 'border-slate-500'}`}>
                         {scope === 'single' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                      </div>
                      <span className={`text-sm ${scope === 'single' ? 'text-white font-bold' : 'text-slate-300'}`}>Solo esta tarea</span>
                   </label>

                   <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${scope === 'all_future' ? 'bg-brand-primary/20 border-brand-primary/50' : 'bg-[#0B0C10] border-white/10 hover:border-white/20'}`}>
                      <input
                        type="radio"
                        name="scope"
                        value="all_future"
                        checked={scope === 'all_future'}
                        onChange={() => setScope('all_future')}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${scope === 'all_future' ? 'border-brand-primary' : 'border-slate-500'}`}>
                         {scope === 'all_future' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                      </div>
                      <div className="flex flex-col">
                         <span className={`text-sm ${scope === 'all_future' ? 'text-white font-bold' : 'text-slate-300'}`}>Esta y todas las futuras</span>
                         <span className="text-[10px] text-slate-500">Moverá todas las fechas proporcionalmente</span>
                      </div>
                   </label>
                </div>
             </div>
           )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0B0C10]/50">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-[#008f85] text-[#0B0C10] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(0,165,153,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'GUARDAR CAMBIOS'}
          </button>
        </div>

      </div>
    </div>
  )
}
