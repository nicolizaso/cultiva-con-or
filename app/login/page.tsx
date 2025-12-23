"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, signup } from "./actions";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      if (isLogin) {
        const res = await login(formData);
        if (res?.error) {
          setMsg({ type: 'error', text: res.error });
          setLoading(false);
        } else if (res?.success) {
          router.push('/');
          router.refresh();
        }
      } else {
        const res = await signup(formData);
        if (res?.error) {
          setMsg({ type: 'error', text: res.error });
          setLoading(false);
        } else if (res?.success) {
          setMsg({ type: 'success', text: '¡Cuenta creada! Revisa tu email o inicia sesión.' });
          setIsLogin(true); // Cambiar a login automáticamente
          setLoading(false);
        }
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Ocurrió un error inesperado.' });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-4 font-body relative overflow-hidden">
      
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-brand-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#12141C] border border-white/5 mb-4 shadow-2xl shadow-brand-primary/10">
            {/* Si tienes el logo usa Image, si no el icono */}
            <Image 
            src="/logo-login.png"  // El nombre de tu archivo en public
            alt="Logo Ojitos"
            width={72}             // Ancho visual
            height={72}            // Alto visual
            className="w-15 h-15 object-contain" // Ajustamos a w-10 (40px) para dejar un poco de aire alrededor
          />
          </div>
          <h1 className="text-3xl font-title font-light text-white mb-2">
            Cultiva con <span className="text-brand-primary font-bold">Ojitos</span>
          </h1>
          <p className="text-slate-500 text-sm">Tu compañía durante el cultivo</p>
        </div>

        {/* Tarjeta Bento Login */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
            
            {/* Selector Toggle */}
            <div className="flex bg-[#0B0C10] p-1 rounded-xl mb-6 border border-white/5 relative">
                <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1a1a1a] rounded-lg transition-all duration-300 shadow-sm border border-white/5 ${isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                ></div>
                <button 
                    type="button"
                    onClick={() => { setIsLogin(true); setMsg(null); }}
                    className={`flex-1 relative z-10 text-sm font-bold py-2.5 text-center transition-colors ${isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Iniciar Sesión
                </button>
                <button 
                    type="button"
                    onClick={() => { setIsLogin(false); setMsg(null); }}
                    className={`flex-1 relative z-10 text-sm font-bold py-2.5 text-center transition-colors ${!isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Registrarse
                </button>
            </div>

            {msg && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-bold border flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${
                    msg.type === 'error' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                    {msg.type === 'error' ? '⚠️' : '✅'} {msg.text}
                </div>
            )}

            <form onSubmit={handleOnSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Email</label>
                    <input 
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Contraseña</label>
                    <input 
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-primary hover:bg-[#008f85] text-[#0B0C10] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} /> 
                    ) : (
                        <>
                            {isLogin ? "Entrar" : "Crear Cuenta"}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
            © {new Date().getFullYear()} Cultiva con Ojitos v1.0
        </p>
      </div>
    </main>
  );
}