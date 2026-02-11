
import { createClient } from '@/app/lib/supabase-server';

async function checkLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('logs').select('*').limit(1);
  console.log('Logs structure:', data ? Object.keys(data[0]) : 'No data');
  if (error) console.error(error);
}

checkLogs();
