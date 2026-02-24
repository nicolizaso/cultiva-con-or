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

  if (!isOpen) return null

  // Filter tasks logic
  // Include tasks where:
  // 1. task.cycle_id matches selectedCycleId
  // 2. OR task has plants in the selected cycle (via task_plants)
  const filteredTasks = selectedCycleId === 'all'
    ? tasks
    : tasks.filter(t => {
        if (t.cycle_id === selectedCycleId) return true;
        if (t.task_plants && t.task_plants.some(tp => tp.plants?.cycle_id === selectedCycleId)) return true;
        return false;
      })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#12141C] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#12141C] z-20">
          <h2 className="text-xl font-title text-white flex items-center gap-2">
            <ClipboardList className="text-brand-primary" />
            Agenda
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cycle Filter */}
        {cycles.length > 0 && (
          <div className="px-4 py-3 border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-hide bg-[#0B0C10]">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCycleId('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                  ${selectedCycleId === 'all'
                    ? 'bg-brand-primary text-black'
                    : 'bg-[#12141C] text-slate-400 border border-white/10 hover:border-brand-primary/50 hover:text-white'}
                `}
              >
                Todos
              </button>
              {cycles.map(cycle => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                    ${selectedCycleId === cycle.id
                      ? 'bg-brand-primary text-black'
                      : 'bg-[#12141C] text-slate-400 border border-white/10 hover:border-brand-primary/50 hover:text-white'}
                  `}
                >
                  {cycle.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4">
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
