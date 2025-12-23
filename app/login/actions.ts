'use server';

import { createClient } from '@/app/lib/supabase-server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
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