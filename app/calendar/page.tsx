import { createClient } from "@/app/lib/supabase-server";
import Link from "next/link";
import CalendarWidget from "@/components/CalendarWidget";
import GlobalHeader from "@/components/GlobalHeader";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: logs } = await supabase
    .from('logs')
    .select(`*, plants ( name )`)
    .order('created_at', { ascending: true });

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`*, description, plants ( name )`)
    .order('due_date', { ascending: true });

  return (
    <main className="min-h-screen bg-[#0B0C10] text-slate-200 p-4 md:p-8 pb-24 font-body">
      <GlobalHeader userEmail={user?.email} title="Agenda" subtitle="Planificación" />
      <div className="max-w-6xl mx-auto">
        <CalendarWidget logs={logs || []} tasks={tasks || []} />
      </div>
    </main>
  );
}