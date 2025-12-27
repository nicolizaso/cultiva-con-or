'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase-server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const loginInput = formData.get('email') as string
  const password = formData.get('password') as string

  let email = loginInput

  // 1. Detectar si es un Usuario (si no tiene @)
  if (!loginInput.includes('@')) {
    // Buscamos el email en la tabla 'profiles'
    // Usamos .ilike() para ignorar mayúsculas (ej: 'Nico' es igual a 'nico')
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', loginInput)
      .single()

    if (error || !profile || !profile.email) {
      console.error('Error buscando usuario:', error) // Esto aparecerá en tu terminal si falla
      return { error: 'Usuario desconocido. Intenta con tu email.' }
    }
    
    email = profile.email
  }

  // 2. Login con el email (el ingresado o el que encontramos por usuario)
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Contraseña incorrecta.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const username = formData.get('username') as string

  // Validaciones
  if (!email || !password || !username) return { error: 'Todos los campos son obligatorios.' }
  if (password !== confirmPassword) return { error: 'Las contraseñas no coinciden.' }
  if (password.length < 6) return { error: 'Mínimo 6 caracteres para la contraseña.' }

  // Verificar si ya existe el usuario (case-insensitive)
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', username)
    .single()
  
  if (existingUser) {
    return { error: 'Ese nombre de usuario ya está en uso.' }
  }

  // Crear usuario
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }, // Guardamos en metadata para el trigger
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Auto-Login post registro
  if (data.user) {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}