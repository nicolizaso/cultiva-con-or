'use client'

import { Check, Trash2, Droplets, FlaskConical, ShieldAlert, Shovel, Scissors, Activity, ArrowRightLeft, CloudRain, Flower, Skull, FileText, RotateCcw } from 'lucide-react'
import { Task } from '@/app/lib/types'

interface TaskPillProps {
  task: Task
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (task: Task) => void
  readOnly?: boolean
}

// Helper para obtener icono y colores según el tipo
const getTaskStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case 'riego': return { color: 'bg-[#00a599]/20 text-[#00a599] border-[#00a599]/30', icon: Droplets }
    case 'fertilizante': return { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: FlaskConical }
    case 'repelente': return { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: ShieldAlert }
    case 'trasplante': return { color: 'bg-amber-700/20 text-amber-300 border-amber-700/30', icon: Shovel }
    case 'poda': return { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Scissors }
    case 'entrenamiento': return { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Activity }
    case 'ambiente': return { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: ArrowRightLeft }
    case 'lavado': return { color: 'bg-slate-600/20 text-slate-300 border-slate-600/30', icon: CloudRain }
    case 'cosechar': return { color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: Flower }
    case 'muerta': return { color: 'bg-red-900/40 text-red-200 border-red-500/30', icon: Skull }
    default: return { color: 'bg-slate-700/40 text-slate-300 border-slate-600/30', icon: FileText }
  }
}

export default function TaskPill({ task, onComplete, onDelete, onClick, readOnly }: TaskPillProps) {
  const style = getTaskStyle(task.type || 'otro')
  const Icon = style.icon
  const isCompleted = task.status === 'completed'

  return (
    <div 
      className={`w-full flex items-center justify-between p-3 rounded-xl border mb-2 cursor-pointer transition-all hover:brightness-110 ${style.color} ${isCompleted ? 'opacity-50' : ''}`}
      onClick={() => onClick && onClick(task)}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-1.5 rounded-lg bg-black/20 shrink-0`}>
          <Icon size={16} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className={`text-sm font-bold truncate ${isCompleted ? 'line-through decoration-2 decoration-current/50' : ''}`}>{task.title}</span>
          <span className="text-[10px] opacity-70 truncate">
            {new Date(task.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            {task.cycleName ? ` • ${task.cycleName}` : ''}
          </span>
        </div>
      </div>

      {!readOnly && (
        <div className="flex gap-2 ml-2">
          {onComplete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
              className={`p-1.5 rounded-lg transition-colors ${isCompleted ? 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-400' : 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400'}`}
              title={isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
            >
              {isCompleted ? <RotateCcw size={14} /> : <Check size={14} />}
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
