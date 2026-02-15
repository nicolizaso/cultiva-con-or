'use server'

import { createClient } from "@/app/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createTask(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { targets, taskType, date, description, otherText } = formData
  if (!targets || targets.length === 0) return { error: 'Selecciona un objetivo.' }

  const title = taskType.id === 'otro' ? otherText : taskType.label
  if (!title) return { error: 'Falta el título.' }

  const tasksToInsert = targets.map((target: any) => ({
    user_id: user.id,
    title: title,
    description: description || null,
    due_date: date, // La DB usa due_date
    date: date,     // Mantenemos compatibilidad
    type: taskType.id,
    status: 'pending',
    plant_id: target.type === 'plant' ? Number(target.id) : null,
    space_id: target.type === 'space' ? Number(target.id) : null
  }))

  const { error } = await supabase.from('tasks').insert(tasksToInsert)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/calendar')
  return { success: true }
}

// --- NUEVAS FUNCIONES PARA EL POPUP ---

export async function updateTask(taskId: string, updates: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({
      description: updates.description,
      due_date: updates.date,
      date: updates.date
    })
    .eq('id', taskId)

  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}

export async function toggleTaskStatus(taskId: string, newStatus: 'pending' | 'completed') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/calendar')
  return { success: true }
}

export async function completeTask(taskId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', taskId)

  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) return { error: error.message }
  
  revalidatePath('/')
  return { success: true }
}