'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import Toast, { ToastType } from '@/components/Toast'

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  })

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true })
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* El Toast vive aquí, flotando sobre toda la app */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={closeToast} 
      />
    </ToastContext.Provider>
  )
}

// Hook personalizado para usarlo fácil
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast debe usarse dentro de un ToastProvider')
  }
  return context
}