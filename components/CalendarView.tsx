'use client'

import { useState } from 'react'
import CalendarWidget from './CalendarWidget'
import DashboardFab from './DashboardFab'

interface CalendarViewProps {
  logs: any[]
  tasks: any[]
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

  return (
    <>
      <div className="max-w-6xl mx-auto">
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
      </div>

      <DashboardFab
        plants={plants}
        spaces={spaces}
        initialDate={selectedDate}
      />
    </>
  )
}
