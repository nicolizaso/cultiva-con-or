"use client";

import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO 
} from "date-fns";
import { es } from "date-fns/locale"; // Para que sea en Español

interface Log {
  id: number;
  created_at: string; // Fecha del evento
  type: string;       // 'Riego', 'Foto', 'Nota', 'Cambio de Etapa', etc.
  title: string;
  notes?: string;
  plants?: { name: string };
}

export default function CalendarWidget({ logs }: { logs: Log[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // 1. Cálculos de fechas para armar la grilla
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Semana empieza Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // 2. Filtrar logs del día seleccionado (Para el panel lateral/inferior)
  const logsForSelectedDate = logs.filter(log => 
    selectedDate && isSameDay(parseISO(log.created_at), selectedDate)
  );

  // Helper para iconos
  const getIcon = (type: string) => {
    if (type === 'Riego') return '💧';
    if (type === 'Foto') return '📸';
    if (type.includes('Etapa')) return '🚀';
    if (type === 'Poda' || type === 'Defoliación') return '✂️';
    return '📝';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* --- COLUMNA IZQUIERDA: CALENDARIO --- */}
      <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl">
        
        {/* Navegación Mes */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-title text-white capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-[#333] rounded text-white">◀</button>
            <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold uppercase text-brand-primary hover:underline px-2">Hoy</button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-[#333] rounded text-white">▶</button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-brand-muted uppercase py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grilla de días */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            // Buscamos logs para este día específico
            const dayLogs = logs.filter(log => isSameDay(parseISO(log.created_at), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[80px] p-2 rounded-lg border cursor-pointer transition-all relative
                  ${!isCurrentMonth ? 'bg-[#111] border-transparent opacity-40' : 'bg-[#222] border-[#333]'}
                  ${isSelected ? 'ring-2 ring-brand-primary border-brand-primary z-10' : 'hover:border-gray-500'}
                `}
              >
                {/* Número del día */}
                <div className={`text-xs font-bold mb-1 flex justify-between ${isToday ? 'text-brand-primary' : 'text-gray-400'}`}>
                    <span>{format(day, 'd')}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>}
                </div>

                {/* Puntitos de eventos */}
                <div className="flex flex-wrap gap-1 content-start">
                  {dayLogs.slice(0, 5).map((log, i) => (
                    <span key={i} className="text-[10px]" title={`${log.type}: ${log.title}`}>
                      {getIcon(log.type)}
                    </span>
                  ))}
                  {dayLogs.length > 5 && (
                    <span className="text-[8px] text-gray-500">+{dayLogs.length - 5}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- COLUMNA DERECHA: DETALLE DEL DÍA --- */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-brand-card border border-[#333] rounded-2xl p-6 sticky top-6">
            <h3 className="text-xl font-subtitle text-white mb-1 capitalize">
                {selectedDate ? format(selectedDate, 'EEEE d', { locale: es }) : 'Selecciona un día'}
            </h3>
            <p className="text-xs text-brand-muted mb-6 uppercase font-bold">
                {selectedDate ? format(selectedDate, 'MMMM yyyy', { locale: es }) : ''}
            </p>

            {/* Lista de eventos del día */}
            <div className="space-y-4">
                {logsForSelectedDate.length > 0 ? (
                    logsForSelectedDate.map(log => (
                        <div key={log.id} className="bg-[#1a1a1a] border border-[#333] p-3 rounded-lg hover:border-brand-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-lg">{getIcon(log.type)}</span>
                                <span className="text-[10px] bg-[#333] text-gray-400 px-2 py-0.5 rounded uppercase">{log.type}</span>
                            </div>
                            <h4 className="font-bold text-white text-sm mb-1">{log.title}</h4>
                            {log.plants?.name && (
                                <p className="text-xs text-brand-primary mb-1">🌿 {log.plants.name}</p>
                            )}
                            {log.notes && (
                                <p className="text-xs text-brand-muted line-clamp-2 italic">"{log.notes}"</p>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-brand-muted border border-dashed border-[#333] rounded-lg">
                        <p>No hay eventos este día.</p>
                        {/* Aquí podríamos poner un botón "Agregar Tarea" en el futuro */}
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
}