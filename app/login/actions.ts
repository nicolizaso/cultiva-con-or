'use server';

import { createClient } from '@/app/lib/supabase-server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Intentamos login normal (email/password)
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciales inválidas' };
  }

  // Importante: revalidar para actualizar el layout (ej: que aparezca el menú de usuario)
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  // Validación básica
  if (!email || !password || !username) {
     return { error: 'Faltan campos obligatorios' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        username: username,
      }
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Si hay sesión, el usuario entró directo (email confirm off o supbase config)
  if (data.session) {
      revalidatePath('/', 'layout');
      return { success: true, session: true };
  }

  return { success: true, session: false };
}

export async function signout() {
  const supabase = await createClient();
  
  // 1. Cerrar sesión en Supabase (borra cookies)
  await supabase.auth.signOut();

  // 2. Limpiar la caché de toda la app para evitar que queden datos viejos visibles
  revalidatePath('/', 'layout');

  // 3. Redirigir al usuario al login
  redirect('/login');
}
