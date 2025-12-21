import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import CalendarWidget from "@/components/CalendarWidget";
import UserMenu from "@/components/UserMenu";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Traemos TODOS los logs (Bitácora)
  // En una app real con miles de datos, filtraríamos por mes, 
  // pero para empezar está bien traer todo.
  const { data: logs } = await supabase
    .from('logs')
    .select(`
      *,
      plants ( name )
    `)
    .order('created_at', { ascending: true });

  return (
    <main className="min-h-screen bg-brand-bg p-6 pb-24">
      
      {/* HEADER */}
      <header className="mb-8 flex justify-between items-center">
        <div>
            <div className="mb-2">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-sm py-2 pr-4 font-bold"
                >
                    <span>←</span> VOLVER AL INICIO
                </Link>
            </div>
            <h1 className="text-3xl font-title text-white uppercase tracking-wider">
              Calendario
            </h1>
            <p className="text-brand-muted font-body text-sm">
              Agenda de riegos, tareas y planificación
            </p>
        </div>
        <UserMenu email={user?.email} />
      </header>

      {/* WIDGET PRINCIPAL */}
      <div className="max-w-5xl mx-auto">
        <CalendarWidget logs={logs || []} />
      </div>

    </main>
  );
}