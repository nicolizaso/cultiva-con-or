'use client'

import { useState } from 'react'
import CalendarWidget from './CalendarWidget'
import DashboardFab from './DashboardFab'

interface CalendarViewProps {
  logs: any[]
  tasks: any[]
  plants: any[]
  spaces: any[]
}

export default function CalendarView({ logs, tasks, plants, spaces }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <CalendarWidget
          logs={logs}
          tasks={tasks}
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
