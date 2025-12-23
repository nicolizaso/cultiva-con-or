"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Droplets, Camera, StickyNote, Rocket, Scissors, ChevronLeft, ChevronRight } from "lucide-react";

interface Log {
  id: number;
  created_at: string;
  type: string;
  title: string;
  notes?: string;
  plants?: any; // Usamos any temporalmente para manejar la inconsistencia de array/objeto
}

export default function CalendarWidget({ logs }: { logs: Log[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const logsForSelectedDate = logs.filter(log => selectedDate && isSameDay(parseISO(log.created_at), selectedDate));

  const getIcon = (type: string) => {
    if (type === 'Riego') return <Droplets size={14} className="text-blue-400" />;
    if (type === 'Foto') return <Camera size={14} className="text-yellow-400" />;
    if (type.includes('Etapa')) return <Rocket size={14} className="text-purple-400" />;
    if (type === 'Poda' || type === 'Defoliación') return <Scissors size={14} className="text-red-400" />;
    return <StickyNote size={14} className="text-slate-400" />;
  };

  const getPlantName = (plants: any) => {
    if (!plants) return null;
    if (Array.isArray(plants) && plants.length > 0) return plants[0].name;
    if (typeof plants === 'object') return plants.name;
    return null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* CALENDARIO */}
      <div className="flex-1 bg-[#12141C] border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-title font-light text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-full text-white"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold uppercase text-brand-primary hover:underline px-2 font-body">Hoy</button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-full text-white"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayLogs = logs.filter(log => isSameDay(parseISO(log.created_at), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[80px] p-2 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between
                  ${!isCurrentMonth ? 'bg-transparent border-transparent opacity-20' : 'bg-[#0B0C10] border-white/5'}
                  ${isSelected ? 'ring-1 ring-brand-primary border-brand-primary z-10 bg-[#1a1a1a]' : 'hover:border-slate-600'}
                `}
              >
                <div className={`text-[10px] font-bold mb-1 flex justify-between ${isToday ? 'text-brand-primary' : 'text-slate-500'}`}>
                    <span>{format(day, 'd')}</span>
                    {isToday && <span className="w-1 h-1 rounded-full bg-brand-primary"></span>}
                </div>
                <div className="flex flex-wrap gap-1 content-start">
                  {dayLogs.slice(0, 4).map((log, i) => (
                    <span key={i} title={`${log.type}: ${log.title}`}>{getIcon(log.type)}</span>
                  ))}
                  {dayLogs.length > 4 && <span className="text-[8px] text-slate-500">+{dayLogs.length - 4}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETALLE LATERAL */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 sticky top-6">
            <h3 className="text-xl font-title font-light text-white mb-1 capitalize">
                {selectedDate ? format(selectedDate, 'EEEE d', { locale: es }) : 'Selecciona un día'}
            </h3>
            <div className="space-y-4 mt-6">
                {logsForSelectedDate.length > 0 ? (
                    logsForSelectedDate.map(log => {
                        const plantName = getPlantName(log.plants);
                        return (
                            <div key={log.id} className="bg-[#0B0C10] border border-white/5 p-3 rounded-xl hover:border-brand-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span>{getIcon(log.type)}</span>
                                    <span className="text-[9px] bg-[#1a1a1a] text-slate-400 px-2 py-0.5 rounded uppercase font-bold">{log.type}</span>
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1">{log.title}</h4>
                                {plantName && (
                                    <p className="text-xs text-brand-primary mb-1">🌿 {plantName}</p>
                                )}
                                {log.notes && <p className="text-xs text-slate-500 italic">"{log.notes}"</p>}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-xl">
                        <p className="text-sm">Sin eventos.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}