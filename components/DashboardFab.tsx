'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddTaskModal from './AddTaskModal'

interface Plant { id: string; name: string; }
interface Space { id: number; name: string; }

export default function DashboardFab({ plants, spaces, initialDate }: { plants: Plant[], spaces: Space[], initialDate?: Date }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Botón Flotante (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        // CAMBIO AQUÍ: Usamos bottom-[110px] para darle la altura exacta que pediste
        className="fixed bottom-[110px] right-6 z-40 w-14 h-14 bg-brand-primary hover:bg-[#008f85] rounded-full shadow-[0_0_20px_rgba(0,165,153,0.4)] flex items-center justify-center text-[#0B0C10] transition-transform hover:scale-105 active:scale-95 group"
        aria-label="Crear Tarea"
      >
        <Plus size={32} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Modal de Creación */}
      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        plants={plants}
        spaces={spaces}
        initialDate={initialDate}
      />
    </>
  )
}