'use client'

import { useState } from 'react'
import { Task } from '@/app/lib/types'
import { X, ClipboardList } from 'lucide-react'
import AgendaList from './AgendaList'

interface AgendaModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  cycles: { id: number; name: string }[]
}

export default function AgendaModal({ isOpen, onClose, tasks, cycles }: AgendaModalProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')

  if (!isOpen) return null

  // Filter tasks logic
  // Include tasks where:
  // 1. task.cycle_id matches selectedCycleId OR task has plants in the selected cycle
  // 2. AND task status matches statusFilter (if not 'all')
  const filteredTasks = tasks.filter(t => {
    // Cycle Filter
    const matchesCycle = selectedCycleId === 'all'
      ? true
      : (t.cycle_id === selectedCycleId ||
         (t.task_plants && t.task_plants.some(tp => tp.plants?.cycle_id === selectedCycleId)))

    // Status Filter
    const matchesStatus = statusFilter === 'all'
      ? true
      : t.status === statusFilter

    return matchesCycle && matchesStatus
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#12141C] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-[#12141C] z-20 border-b border-white/5 sticky top-0">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-title text-white flex items-center gap-2">
              <ClipboardList className="text-brand-primary" />
              Agenda
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Filters Row */}
          <div className="px-4 pb-4 flex gap-3">
            {/* Cycle Selector */}
            <div className="flex-1">
              <select
                value={selectedCycleId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedCycleId(val === 'all' ? 'all' : Number(val))
                }}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-brand-primary/50"
              >
                <option value="all">Todos los ciclos</option>
                {cycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex-1">
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-xl py-2 px-3 text-white text-sm outline-none focus:border-brand-primary/50"
               >
                  <option value="all">Todas</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completadas</option>
               </select>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0B0C10]/30">
           <AgendaList
              tasks={filteredTasks}
              disableDateFilter={true}
              groupByStatus={true}
           />
        </div>

      </div>
    </div>
  )
}
