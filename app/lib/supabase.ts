import { createBrowserClient } from '@supabase/ssr';

// Creamos un cliente que vive en el navegador y sabe leer las cookies de sesión
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);  