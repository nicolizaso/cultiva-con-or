"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Importante para redirigir
import { login, signup } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Cambio de estrategia: Usamos un evento estándar de React (onSubmit)
  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evitamos que la página se recargue
    setLoading(true);
    setMsg(null);

    // Creamos el FormData manualmente desde el formulario HTML
    const formData = new FormData(e.currentTarget);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const res = await login(formData);
        if (res?.error) {
          setMsg({ type: 'error', text: res.error });
          setLoading(false);
        } else if (res?.success) {
          // Si todo salió bien, redirigimos manualmente
          router.push('/'); // Vamos al Dashboard
          router.refresh(); // Actualizamos los datos
        }
      } else {
        // --- REGISTRO ---
        const res = await signup(formData);
        if (res?.error) {
          setMsg({ type: 'error', text: res.error });
          setLoading(false);
        } else if (res?.success) {
          router.push('/'); 
          router.refresh();
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Ocurrió un error inesperado.' });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-card border border-[#333] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* HEADER DE MARCA */}
        <div className="bg-[#1a1a1a] p-8 text-center border-b border-[#333]">
          <h1 className="text-4xl font-title text-brand-primary uppercase tracking-wider mb-2">
            Cultiva con <span className="text-white">Ojitos</span>
          </h1>
          <p className="text-brand-muted text-sm font-body">Tu bitácora de cultivo inteligente</p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#333]">
          <button
            type="button" // Importante: type button para que no envíe el formulario
            onClick={() => { setIsLogin(true); setMsg(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              isLogin ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary' : 'text-brand-muted hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setMsg(null); }}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              !isLogin ? 'bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary' : 'text-brand-muted hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* FORMULARIO */}
        {/* Usamos onSubmit en lugar de action */}
        <form onSubmit={handleOnSubmit} className="p-8 space-y-5">
          
          {msg && (
            <div className={`p-3 rounded-lg text-sm text-center font-bold ${
              msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              {msg.text}
            </div>
          )}

          <div>
            <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Email</label>
            <input 
              name="email"
              type="email"
              required
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none transition"
              placeholder="cultivador@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-brand-muted mb-1 text-xs font-bold uppercase">Contraseña</label>
            <input 
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:border-brand-primary outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-bg py-4 rounded-lg font-title tracking-wide text-lg transition disabled:opacity-50 mt-4"
          >
            {loading ? 'PROCESANDO...' : (isLogin ? 'ENTRAR AL CULTIVO' : 'CREAR CUENTA')}
          </button>

        </form>
      </div>
    </main>
  );
}