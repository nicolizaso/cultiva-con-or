'use server';

import { createClient } from '@/app/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: 'Credenciales inválidas' };
  
  // Importante: revalidar para actualizar el layout
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
      // Ajusta esto a tu URL de producción en Vercel
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }
  });

  if (error) return { error: error.message };

  // Si Supabase está configurado para "Auto Confirm", el usuario ya tiene sesión.
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  // Devolvemos true para que el componente cliente maneje la redirección
  return { success: true };
}