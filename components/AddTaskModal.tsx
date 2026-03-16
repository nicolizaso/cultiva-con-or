'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, Sprout, FileText, Check, ChevronDown, Loader2, RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createTask } from '@/app/actions/tasks'
import DatePicker from './DatePicker'
import { useToast } from '@/app/context/ToastContext'
import { TASK_TYPES } from '@/app/lib/constants'

// Interfaces
interface Plant { id: string; name: string; }
interface Space { id: number; name: string; }

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  plants: Plant[]
  spaces: Space[]
  cycles?: { id: number; name: string }[]
  initialDate?: Date
}

export default function AddTaskModal({ isOpen, onClose, plants, spaces, cycles = [], initialDate }: AddTaskModalProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const [selectedTargets, setSelectedTargets] = useState<{ id: string | number, name: string, type: 'plant' | 'space' | 'cycle' }[]>([])
  const [selectedTaskType, setSelectedTaskType] = useState<typeof TASK_TYPES[0] | null>(null)
  // Inicializar con fecha local en formato YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const d = initialDate || new Date()
    return d.toLocaleDateString('en-CA')
  })

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate.toLocaleDateString('en-CA'))
    }
  }, [initialDate])

  const [description, setDescription] = useState('')
  const [otherText, setOtherText] = useState('')
  const [applicationType, setApplicationType] = useState('Riego')
  const [targetStage, setTargetStage] = useState('Vegetativo')

  // Estados de recurrencia
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('daily')
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toLocaleDateString('en-CA')
  })

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

  const toggleTarget = (item: { id: string | number, name: string, type: 'plant' | 'space' | 'cycle' }) => {
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
    if (isRecurring && !endDate) return showToast('Debes seleccionar una fecha de fin.', 'error')

    setIsSubmitting(true)

    const cleanTaskType = {
      id: selectedTaskType.id,
      label: selectedTaskType.label
    }

    const result = await createTask({
      targets: selectedTargets,
      taskType: cleanTaskType,
      applicationType,
      targetStage,
      date: `${date}T12:00:00`, // Forzar mediodía para evitar desfases de zona horaria
      description,
      otherText,
      // Recurrencia
      isRecurring,
      frequency,
      endDate: isRecurring ? `${endDate}T12:00:00` : null
    })

    setIsSubmitting(false)

    if (result?.error) {
      // Error del servidor
      showToast(result.error, 'error')
    } else {
      // Éxito
      showToast('¡Tarea agendada correctamente!', 'success') // <--- Toast de Éxito
      router.refresh()
      
      // Limpiar y cerrar
      setSelectedTargets([])
      setSelectedTaskType(null)
      setDescription('')
      setOtherText('')
      setIsRecurring(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-card-border w-full max-w-md rounded-2xl shadow-sm flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-card-border">
          <h2 className="text-xl font-bold text-foreground tracking-wide">Crear acción o evento</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          
          {/* 1. OBJETIVO */}
          <div className="space-y-1.5 relative" ref={targetRef}>
            <label className="text-[10px] uppercase font-bold text-muted ml-1">Objetivo</label>
            <div 
              onClick={() => setIsTargetOpen(!isTargetOpen)}
              className="min-h-[50px] bg-background border border-card-border rounded-xl px-3 py-2 flex items-center flex-wrap gap-2 cursor-pointer hover:border-brand-primary/50 transition-colors"
            >
              <Sprout className="text-muted shrink-0 mr-1" size={18} />
              
              {selectedTargets.length === 0 && (
                <span className="text-muted text-sm">Seleccionar planta o espacio...</span>
              )}

              {selectedTargets.map((target, idx) => (
                <span key={`${target.type}-${target.id}`} className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-in zoom-in duration-200">
                  {target.name}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeTarget(idx); }}
                    className="hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              
              <div className="ml-auto">
                 <ChevronDown size={16} className={`text-muted transition-transform ${isTargetOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isTargetOpen && (
              <div className="absolute top-full left-0 w-full bg-card border border-card-border rounded-xl mt-2 z-20 shadow-sm max-h-60 overflow-y-auto">
                {cycles.length > 0 && (
                   <div className="p-2 border-b border-card-border">
                     <p className="text-[10px] uppercase font-bold text-muted px-2 py-1">Ciclos</p>
                     {cycles.map(cycle => {
                       const isSelected = selectedTargets.some(t => t.id === cycle.id && t.type === 'cycle')
                       return (
                         <div
                           key={`cycle-${cycle.id}`}
                           onClick={() => toggleTarget({ id: cycle.id, name: cycle.name, type: 'cycle' })}
                           className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'text-foreground hover:bg-card-border'}`}
                         >
                           <div className="flex items-center gap-2">
                             <RefreshCw size={14} className={isSelected ? 'text-brand-primary' : 'text-muted'} />
                             <span>{cycle.name}</span>
                           </div>
                           {isSelected && <Check size={14} />}
                         </div>
                       )
                     })}
                   </div>
                )}

                {spaces.length > 0 && (
                   <div className="p-2">
                     <p className="text-[10px] uppercase font-bold text-muted px-2 py-1">Espacios</p>
                     {spaces.map(space => {
                       const isSelected = selectedTargets.some(t => t.id === space.id && t.type === 'space')
                       return (
                         <div 
                           key={`space-${space.id}`}
                           onClick={() => toggleTarget({ id: space.id, name: space.name, type: 'space' })}
                           className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'text-foreground hover:bg-card-border'}`}
                         >
                           <span>{space.name}</span>
                           {isSelected && <Check size={14} />}
                         </div>
                       )
                     })}
                   </div>
                )}
                
                {plants.length > 0 && (
                   <div className="p-2 border-t border-card-border">
                     <p className="text-[10px] uppercase font-bold text-muted px-2 py-1">Plantas</p>
                     {plants.map(plant => {
                        const isSelected = selectedTargets.some(t => t.id === plant.id && t.type === 'plant')
                        return (
                          <div 
                            key={`plant-${plant.id}`}
                            onClick={() => toggleTarget({ id: plant.id, name: plant.name, type: 'plant' })}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'text-foreground hover:bg-card-border'}`}
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
            <label className="text-[10px] uppercase font-bold text-muted ml-1">Tarea o Evento</label>
            <div 
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className={`w-full bg-background border rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                 selectedTaskType ? `${selectedTaskType.border} ${selectedTaskType.bg}` : 'border-card-border hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                 {selectedTaskType ? (
                    <>
                      <selectedTaskType.icon className={selectedTaskType.color} size={18} />
                      <span className={`text-sm font-bold ${selectedTaskType.id === 'muerta' ? 'text-foreground' : 'text-foreground'}`}>
                        {selectedTaskType.label}
                      </span>
                    </>
                 ) : (
                    <>
                      <FileText className="text-muted" size={18} />
                      <span className="text-muted text-sm">Seleccionar tipo...</span>
                    </>
                 )}
              </div>
              <ChevronDown size={16} className={`text-muted transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
            </div>

            {isTypeOpen && (
              <div className="absolute top-full left-0 w-full bg-card border border-card-border rounded-xl mt-2 z-20 shadow-sm max-h-60 overflow-y-auto">
                <div className="p-2 grid grid-cols-1 gap-1">
                  {TASK_TYPES.map(type => (
                    <div 
                      key={type.id}
                      onClick={() => { setSelectedTaskType(type); setIsTypeOpen(false); }}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-card-border transition-colors"
                    >
                      <div className={`p-1.5 rounded-md bg-background border border-card-border ${type.color}`}>
                         <type.icon size={16} />
                      </div>
                      <span className="text-sm text-foreground">{type.label}</span>
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
                 className="w-full mt-2 bg-background border border-card-border rounded-xl py-2 px-3 text-foreground text-sm outline-none focus:border-brand-primary/50 animate-in slide-in-from-top-1"
                 autoFocus
               />
            )}

            {selectedTaskType?.id === 'fertilizante' && (
               <div className="mt-2 animate-in slide-in-from-top-1">
                 <label className="text-[10px] uppercase font-bold text-muted ml-1">Tipo de Aplicación</label>
                 <div className="relative">
                   <select
                     value={applicationType}
                     onChange={(e) => setApplicationType(e.target.value)}
                     className="w-full bg-background border border-card-border rounded-xl py-3 px-3 text-foreground text-sm outline-none focus:border-brand-primary/50 appearance-none pr-10"
                   >
                     <option value="Riego">Riego</option>
                     <option value="Foliar">Foliar</option>
                     <option value="Directo al Sustrato">Directo al Sustrato</option>
                   </select>
                   <ChevronDown size={16} className="text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                 </div>
               </div>
            )}

            {selectedTaskType?.id === 'cambio_etapa' && (
               <div className="mt-2 animate-in slide-in-from-top-1">
                 <label className="text-[10px] uppercase font-bold text-muted ml-1">Etapa Destino</label>
                 <div className="relative">
                   <select
                     value={targetStage}
                     onChange={(e) => setTargetStage(e.target.value)}
                     className="w-full bg-background border border-card-border rounded-xl py-3 px-3 text-foreground text-sm outline-none focus:border-brand-primary/50 appearance-none pr-10"
                   >
                     <option value="Germinación">Germinación</option>
                     <option value="Plántula">Plántula</option>
                     <option value="Vegetativo">Vegetativo</option>
                     <option value="Enraizamiento">Enraizamiento</option>
                     <option value="Floración">Floración</option>
                     <option value="Secado">Secado</option>
                     <option value="Curado">Curado</option>
                   </select>
                   <ChevronDown size={16} className="text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                 </div>
               </div>
            )}
          </div>

          {/* 3. FECHA (CON DATEPICKER BENTO) */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted ml-1">Fecha</label>
            <DatePicker selectedDate={date} onChange={setDate} />

            {/* RECURRENCIA */}
            <div className="mt-2 flex items-center justify-between bg-background border border-card-border rounded-xl p-3">
               <span className="text-sm text-foreground font-bold">Repetir</span>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-card-border after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
               </label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted ml-1">Frecuencia</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl py-2 px-3 text-foreground text-sm outline-none focus:border-brand-primary/50"
                    >
                      <option value="daily">Diario</option>
                      <option value="every2days">Cada 2 días</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted ml-1">Termina el...</label>
                    <DatePicker selectedDate={endDate} onChange={setEndDate} />
                 </div>
              </div>
            )}
          </div>

          {/* 4. DETALLES */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted ml-1">Detalles</label>
            <textarea 
              placeholder="Descripción adicional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-background border border-card-border rounded-xl py-3 px-4 text-foreground text-sm outline-none focus:border-brand-primary/50 transition-colors resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-card-border bg-background/50">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(0,165,153,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'GUARDAR EVENTO'}
          </button>
        </div>

      </div>
    </div>
  )
}