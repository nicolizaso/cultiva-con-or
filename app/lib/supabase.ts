import { createBrowserClient } from '@supabase/ssr';

// Esta función crea un cliente que SÍ tiene acceso a la sesión del usuario en el navegador
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Exportamos una instancia lista para usar en componentes de cliente (use client)
export const supabase = createClient();