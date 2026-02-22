'use client';

import { useState } from 'react';
import {
  Calendar, ChevronDown, ChevronUp, Clock, History
} from 'lucide-react';
import Image from 'next/image';
import { formatDateShort } from '@/app/lib/utils';
import { getTaskIcon } from '@/app/lib/constants';

export interface TimelineItem {
  id: string;
  originalId: number | string;
  date: string;
  title: string;
  type: string; // 'riego', 'poda', 'log', 'image', etc.
  notes?: string;
  media_url?: string[];
  isTask?: boolean;
  status?: string; // 'pending', 'completed'
}

interface TimelineSectionProps {
  pendingTasks: TimelineItem[];
  historyItems: TimelineItem[];
}

export default function TimelineSection({ pendingTasks, historyItems }: TimelineSectionProps) {
  const [showAllPending, setShowAllPending] = useState(false);

  const pendingToShow = showAllPending ? pendingTasks : pendingTasks.slice(0, 1);
  const hiddenCount = pendingTasks.length - 1;

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent">

      {/* --- PENDING TASKS SECTION --- */}
      {pendingTasks.length > 0 && (
        <div className="relative mb-8">
           {/* Section Header or Separator could go here if needed, but integration is requested */}

           {/* Render Pending Tasks */}
           {pendingToShow.map((item, index) => (
             <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8 last:mb-0">

               {/* Icon */}
               <div className="flex items-center justify-center w-10 h-10 rounded-full border border-dashed border-slate-500 text-slate-400 bg-[#0B0C10] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                 {getTaskIcon(item.type)}
               </div>

               {/* Card */}
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#12141C] p-5 rounded-2xl border border-dashed border-slate-700 hover:border-brand-primary/30 transition-colors shadow-lg">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-white text-sm">{item.title}</span>
                     <span className="text-[9px] uppercase font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Pendiente</span>
                   </div>
                   <time className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                       {formatDateShort(item.date)}
                   </time>
                 </div>
                 {item.notes && <p className="text-slate-400 text-xs leading-relaxed">"{item.notes}"</p>}
               </div>
             </div>
           ))}

           {/* Accordion Trigger */}
           {pendingTasks.length > 1 && (
             <div className="relative flex items-center justify-center md:my-4 z-10">
                <button
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="flex items-center gap-2 bg-[#1A1C25] border border-white/10 text-slate-400 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all hover:border-white/20"
                >
                  {showAllPending ? (
                    <>
                      <ChevronUp size={14} /> Ocultar tareas futuras
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> Mostrar {hiddenCount} tarea{hiddenCount !== 1 ? 's' : ''} más
                    </>
                  )}
                </button>
             </div>
           )}
        </div>
      )}

      {/* --- HISTORY SECTION --- */}
      {historyItems.map((item) => (
        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

          {/* Icon */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${item.type === 'image' ? 'border-brand-primary text-brand-primary' : 'border-[#333] text-brand-primary'} bg-[#0B0C10] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
             {getTaskIcon(item.type)}
          </div>

          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#12141C] p-5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{item.title}</span>
                {item.type === 'image' && <span className="text-[9px] uppercase font-bold bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded">Foto</span>}
              </div>
              <time className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {formatDateShort(item.date)}
              </time>
            </div>

            {item.notes && <p className="text-slate-400 text-xs leading-relaxed mb-3">"{item.notes}"</p>}

            {/* Render Images (Log media OR Cycle Image public_url) */}
            {item.media_url && item.media_url.length > 0 && (
              <div className={`grid gap-2 mt-2 ${item.media_url.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {item.media_url.map((url: string, i: number) => (
                      <div key={i} className="relative h-32 w-full rounded-lg overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors">
                          <Image src={url} alt="Timeline Media" fill className="object-cover" />
                      </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {historyItems.length === 0 && pendingTasks.length === 0 && (
        <div className="text-center py-10 z-10 relative">
            <p className="text-slate-500 text-sm">Sin registros aún.</p>
        </div>
      )}

    </div>
  );
}
