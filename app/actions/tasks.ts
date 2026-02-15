'use server'

import { createClient } from "@/app/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createTask(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { targets, taskType, date, description, otherText, isRecurring, frequency, endDate } = formData
  if (!targets || targets.length === 0) return { error: 'Selecciona un objetivo.' }

  const title = taskType.id === 'otro' ? otherText : taskType.label
  if (!title) return { error: 'Falta el título.' }

  let tasksToInsert: any[] = []

  // Helper to create task objects for a specific date string (YYYY-MM-DD...)
  const createTasksForDate = (dateStr: string) => {
    return targets.map((target: any) => ({
      user_id: user.id,
      title: title,
      description: description || null,
      due_date: dateStr, // La DB usa due_date
      date: dateStr,     // Mantenemos compatibilidad
      type: taskType.id,
      status: 'pending',
      plant_id: target.type === 'plant' ? Number(target.id) : null,
      space_id: target.type === 'space' ? Number(target.id) : null
    }))
  }

  if (isRecurring && endDate) {
    const startDateObj = new Date(date)
    const endDateObj = new Date(endDate)
    let current = new Date(startDateObj)
    let count = 0
    const maxIterations = 50 // Safety limit

    while (current <= endDateObj && count < maxIterations) {
      // Format current date back to string compatible with DB
      // We use local time components to avoid timezone shifts
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}T12:00:00`

      tasksToInsert = [...tasksToInsert, ...createTasksForDate(formattedDate)]

      // Increment based on frequency
      switch (frequency) {
        case 'daily':
          current.setDate(current.getDate() + 1)
          break
        case 'every2days':
          current.setDate(current.getDate() + 2)
          break
        case 'weekly':
          current.setDate(current.getDate() + 7)
          break
        case 'biweekly':
          current.setDate(current.getDate() + 14)
          break
        case 'monthly':
          current.setMonth(current.getMonth() + 1)
          break
        default:
          current.setDate(current.getDate() + 1)
      }
      count++
    }
  } else {
    // Single task
    tasksToInsert = createTasksForDate(date)
  }

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

export async function deleteTasks(taskIds: string[]) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('id', taskIds)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/calendar')
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
