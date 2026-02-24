'use client'

import { useState } from 'react'
import CalendarWidget from './CalendarWidget'
import DashboardFab from './DashboardFab'
import AgendaList from './AgendaList'
import { Task } from '@/app/lib/types'

interface CalendarViewProps {
  logs: any[]
  tasks: Task[]
  plants: any[]
  spaces: any[]
  cycles?: { id: number; name: string }[]
}

export default function CalendarView({ logs, tasks, plants, spaces, cycles = [] }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedCycleId, setSelectedCycleId] = useState<number | 'all'>('all')

  const filteredTasks = selectedCycleId === 'all'
    ? tasks
    : tasks.filter(t => t.cycle_id === selectedCycleId)

  const filteredLogs = selectedCycleId === 'all'
    ? logs
    : logs.filter(l => l.cycle_id === selectedCycleId)

  // Filter tasks for Global Agenda (Pending + Sorted by Date)
  const globalTasks = filteredTasks
    .filter(t => t.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  return (
    <>
      <div className="max-w-6xl mx-auto pb-32">
        {cycles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCycleId('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                ${selectedCycleId === 'all'
                  ? 'bg-brand-primary text-black'
                  : 'bg-[#12141C] text-slate-400 border border-white/5 hover:border-brand-primary/50 hover:text-white'}
              `}
            >
              Todos
            </button>
            {cycles.map(cycle => (
              <button
                key={cycle.id}
                onClick={() => setSelectedCycleId(cycle.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                  ${selectedCycleId === cycle.id
                    ? 'bg-brand-primary text-black'
                    : 'bg-[#12141C] text-slate-400 border border-white/5 hover:border-brand-primary/50 hover:text-white'}
                `}
              >
                {cycle.name}
              </button>
            ))}
          </div>
        )}

        <CalendarWidget
          logs={filteredLogs}
          tasks={filteredTasks}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Global Agenda Section */}
        <div className="mt-12 border-t border-white/5 pt-8">
           <h3 className="text-xl font-title font-light text-white mb-6 flex items-center gap-3">
              Agenda Global
              <span className="text-xs font-bold bg-brand-primary/20 text-brand-primary px-2.5 py-1 rounded-full border border-brand-primary/20">
                 {globalTasks.length} pendientes
              </span>
           </h3>

           <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 shadow-xl">
              <AgendaList tasks={globalTasks} disableDateFilter={true} />
           </div>
        </div>
      </div>

      <DashboardFab
        plants={plants}
        spaces={spaces}
        initialDate={selectedDate}
      />
    </>
  )
}
