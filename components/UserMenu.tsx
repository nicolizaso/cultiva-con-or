"use client";

import { useState, useRef, useEffect } from "react";
import { signout } from "@/app/login/actions";
import { useRouter } from "next/navigation"; // Importar router

export default function UserMenu({ email }: { email?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Hook de navegación
  const menuRef = useRef<HTMLDivElement>(null);

  // ... (tu useEffect para click outside sigue igual) ...
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signout();
    router.push('/login'); // Redirección explícita
    router.refresh();      // Limpia caché del router
  };

  const initial = email ? email[0].toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all border-2 ${
            isOpen 
            ? 'bg-brand-primary text-brand-bg border-brand-primary' 
            : 'bg-brand-card text-brand-primary border-brand-primary/50'
        }`}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-brand-card border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#333] bg-[#1a1a1a]">
            <p className="text-xs text-brand-muted uppercase font-bold mb-1">Conectado como</p>
            <p className="text-sm text-white truncate font-body" title={email}>
                {email || "Usuario"}
            </p>
          </div>

          <div className="p-1">
            <button 
                onClick={handleLogout} // Usamos la nueva función
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
            >
                🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}