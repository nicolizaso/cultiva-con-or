'use client'

import { CalendarDays, CheckCircle2 } from "lucide-react"
import { Task } from "@/app/lib/types"

export default function HomeTaskCard({ tasks }: { tasks: Task[] }) {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const pendingCount = tasks.filter(t =>
    t.status === 'pending' &&
    t.due_date &&
    t.due_date.split('T')[0] === todayStr
  ).length;

  return (
    <div className="bg-brand-primary/10 p-5 rounded-2xl border border-brand-primary/20 hover:bg-brand-primary/20 transition-all group flex flex-col h-full relative cursor-default justify-between">
       
       <p className="text-[10px] uppercase tracking-widest text-brand-primary font-bold font-body mb-2">Tareas Pendientes</p>

       <div className="flex items-end justify-between">
         {pendingCount > 0 ? (
            <span className="text-4xl font-title font-light text-brand-primary group-hover:scale-105 transition-transform origin-left">
              {pendingCount}
            </span>
         ) : (
            <div className="flex items-center gap-2 text-brand-primary opacity-80 mb-1">
              <CheckCircle2 size={24} />
              <span className="text-sm font-bold">¡Todo listo!</span>
            </div>
         )}
         <CalendarDays className="text-brand-primary w-8 h-8 opacity-80 group-hover:rotate-12 transition-transform duration-500" strokeWidth={1.5} />
       </div>
    </div>
  )
}
