'use server';

import { createClient } from '@/app/lib/supabase-server';

export async function login(formData: FormData) {
  // 1. Envolvemos TODO en try/catch para que si explota, el front se entere
  try {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Auth Error:", error.message);
      return { error: 'Credenciales inválidas o error de conexión' };
    }

    return { success: true };

  } catch (err) {
    console.error("Server Action Error Critico:", err);
    return { error: 'Error interno del servidor. Revisa las variables de entorno.' };
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      // Opciones para evitar confirmación de email si lo tienes desactivado
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cultivaconojitos.vercel.app'}/auth/callback`,
      }
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Signup Error:", err);
    return { error: 'Error al intentar registrarse.' };
  }
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}