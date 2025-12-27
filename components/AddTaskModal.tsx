'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, Sprout, FileText, Droplets, FlaskConical, 
  ShieldAlert, Shovel, Scissors, Activity, ArrowRightLeft, 
  CloudRain, Flower, Skull, PenTool, Check, ChevronDown, Loader2
} from 'lucide-react'
import { createTask } from '@/app/actions/tasks'
import DatePicker from './DatePicker'
import { useToast } from '@/app/context/ToastContext' // <--- Importamos el hook

// Interfaces
interface Plant { id: string; name: string; }
interface Space { id: number; name: string; }

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  plants: Plant[]
  spaces: Space[]
}

const TASK_TYPES = [
  { id: 'riego', label: 'Riego', icon: Droplets, color: 'text-[#00a599]', border: 'border-[#00a599]/30', bg: 'bg-[#00a599]/10' },
  { id: 'fertilizante', label: 'Fertilizante', icon: FlaskConical, color: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/10' },
  { id: 'repelente', label: 'Repelente', icon: ShieldAlert, color: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  { id: 'trasplante', label: 'Trasplante', icon: Shovel, color: 'text-amber-700', border: 'border-amber-700/30', bg: 'bg-amber-700/10' },
  { id: 'poda', label: 'Poda', icon: Scissors, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
  { id: 'entrenamiento', label: 'Entrenamiento', icon: Activity, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
  { id: 'ambiente', label: 'Cambiar Ambiente', icon: ArrowRightLeft, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
  { id: 'lavado', label: 'Lavado de Raíces', icon: CloudRain, color: 'text-slate-500', border: 'border-slate-500/30', bg: 'bg-slate-500/10' },
  { id: 'cosechar', label: 'Cosechar', icon: Flower, color: 'text-violet-500', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  { id: 'muerta', label: 'Declarar Muerta', icon: Skull, color: 'text-white', border: 'border-white/30', bg: 'bg-black' },
  { id: 'otro', label: 'Otro', icon: PenTool, color: 'text-slate-400', border: 'border-slate-400/30', bg: 'bg-slate-400/10' },
]

export default function AddTaskModal({ isOpen, onClose, plants, spaces }: AddTaskModalProps) {
  const { showToast } = useToast() // <--- Inicializamos el toast

  const [selectedTargets, setSelectedTargets] = useState<{ id: string | number, name: string, type: 'plant' | 'space' }[]>([])
  const [selectedTaskType, setSelectedTaskType] = useState<typeof TASK_TYPES[0] | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [otherText, setOtherText] = useState('') 

  const [isTargetOpen, setIsTargetOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const targetRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (targetRef.current && !targetRef.current.contains(event.target as Node)) setIsTargetOpen(false)
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) setIsTypeOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isOpen) return null

  const toggleTarget = (item: { id: string | number, name: string, type: 'plant' | 'space' }) => {
    const exists = selectedTargets.find(t => t.id === item.id && t.type === item.type)
    if (exists) {
      setSelectedTargets(prev => prev.filter(t => !(t.id === item.id && t.type === item.type)))
    } else {
      setSelectedTargets(prev => [...prev, item])
    }
  }

  const removeTarget = (index: number) => {
    setSelectedTargets(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validaciones con Toast de Error
    if (selectedTargets.length === 0) return showToast('Selecciona al menos una planta o espacio.', 'error')
    if (!selectedTaskType) return showToast('Debes seleccionar un tipo de tarea.', 'error')
    if (selectedTaskType.id === 'otro' && !otherText.trim()) return showToast('Escribe el nombre de la tarea personalizada.', 'error')

    setIsSubmitting(true)

    const cleanTaskType = {
      id: selectedTaskType.id,
      label: selectedTaskType.label
    }

    const result = await createTask({
      targets: selectedTargets,
      taskType: cleanTaskType, 
      date,
      description,
      otherText
    })

    setIsSubmitting(false)

    if (result?.error) {
      // Error del servidor
      showToast(result.error, 'error')
    } else {
      // Éxito
      showToast('¡Tarea agendada correctamente!', 'success') // <--- Toast de Éxito
      
      // Limpiar y cerrar
      setSelectedTargets([])
      setSelectedTaskType(null)
      setDescription('')
      setOtherText('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#12141C] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-wide">Crear acción o evento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          
          {/* 1. OBJETIVO */}
          <div className="space-y-1.5 relative" ref={targetRef}>
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Objetivo</label>
            <div 
              onClick={() => setIsTargetOpen(!isTargetOpen)}
              className="min-h-[50px] bg-[#0B0C10] border border-white/10 rounded-xl px-3 py-2 flex items-center flex-wrap gap-2 cursor-pointer hover:border-brand-primary/50 transition-colors"
            >
              <Sprout className="text-slate-500 shrink-0 mr-1" size={18} />
              
              {selectedTargets.length === 0 && (
                <span className="text-slate-500 text-sm">Seleccionar planta o espacio...</span>
              )}

              {selectedTargets.map((target, idx) => (
                <span key={`${target.type}-${target.id}`} className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-in zoom-in duration-200">
                  {target.name}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeTarget(idx); }}
                    className="hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              
              <div className="ml-auto">
                 <ChevronDown size={16} className={`text-slate-500 transition-transform ${isTargetOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isTargetOpen && (
              <div className="absolute top-full left-0 w-full bg-[#1A1C25] border border-white/10 rounded-xl mt-2 z-20 shadow-xl max-h-60 overflow-y-auto">
                {spaces.length > 0 && (
                   <div className="p-2">
                     <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Espacios</p>
                     {spaces.map(space => {
                       const isSelected = selectedTargets.some(t => t.id === space.id && t.type === 'space')
                       return (
                         <div 
                           key={`space-${space.id}`}
                           onClick={() => toggleTarget({ id: space.id, name: space.name, type: 'space' })}
                           className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-300 hover:bg-white/5'}`}
                         >
                           <span>{space.name}</span>
                           {isSelected && <Check size={14} />}
                         </div>
                       )
                     })}
                   </div>
                )}
                
                {plants.length > 0 && (
                   <div className="p-2 border-t border-white/5">
                     <p className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Plantas</p>
                     {plants.map(plant => {
                        const isSelected = selectedTargets.some(t => t.id === plant.id && t.type === 'plant')
                        return (
                          <div 
                            key={`plant-${plant.id}`}
                            onClick={() => toggleTarget({ id: plant.id, name: plant.name, type: 'plant' })}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-300 hover:bg-white/5'}`}
                          >
                            <span>{plant.name}</span>
                            {isSelected && <Check size={14} />}
                          </div>
                        )
                     })}
                   </div>
                )}
              </div>
            )}
          </div>

          {/* 2. TIPO DE TAREA */}
          <div className="space-y-1.5 relative" ref={typeRef}>
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Tarea o Evento</label>
            <div 
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className={`w-full bg-[#0B0C10] border rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                 selectedTaskType ? `${selectedTaskType.border} ${selectedTaskType.bg}` : 'border-white/10 hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                 {selectedTaskType ? (
                    <>
                      <selectedTaskType.icon className={selectedTaskType.color} size={18} />
                      <span className={`text-sm font-bold ${selectedTaskType.id === 'muerta' ? 'text-white' : 'text-slate-200'}`}>
                        {selectedTaskType.label}
                      </span>
                    </>
                 ) : (
                    <>
                      <FileText className="text-slate-500" size={18} />
                      <span className="text-slate-500 text-sm">Seleccionar tipo...</span>
                    </>
                 )}
              </div>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
            </div>

            {isTypeOpen && (
              <div className="absolute top-full left-0 w-full bg-[#1A1C25] border border-white/10 rounded-xl mt-2 z-20 shadow-xl max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-1 gap-1">
                  {TASK_TYPES.map(type => (
                    <div 
                      key={type.id}
                      onClick={() => { setSelectedTaskType(type); setIsTypeOpen(false); }}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className={`p-1.5 rounded-md bg-[#0B0C10] border border-white/5 ${type.color}`}>
                         <type.icon size={16} />
                      </div>
                      <span className="text-sm text-slate-300">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTaskType?.id === 'otro' && (
               <input 
                 type="text"
                 placeholder="Especifique la tarea..."
                 value={otherText}
                 onChange={(e) => setOtherText(e.target.value)}
                 className="w-full mt-2 bg-[#0B0C10] border border-white/10 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-brand-primary/50 animate-in slide-in-from-top-1"
                 autoFocus
               />
            )}
          </div>

          {/* 3. FECHA (CON DATEPICKER BENTO) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Fecha</label>
            <DatePicker selectedDate={date} onChange={setDate} />
          </div>

          {/* 4. DETALLES */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Detalles</label>
            <textarea 
              placeholder="Descripción adicional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand-primary/50 transition-colors resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0B0C10]/50">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-[#008f85] text-[#0B0C10] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(0,165,153,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'GUARDAR EVENTO'}
          </button>
        </div>

      </div>
    </div>
  )
}