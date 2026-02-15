'use server'

import { createClient } from "@/app/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { randomUUID } from 'crypto'

export async function createTask(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { targets, taskType, date, description, otherText, isRecurring, frequency, endDate } = formData
  if (!targets || targets.length === 0) return { error: 'Selecciona un objetivo.' }

  const title = taskType.id === 'otro' ? otherText : taskType.label
  if (!title) return { error: 'Falta el título.' }

  let tasksToInsert: any[] = []

  // Generate a recurrence ID if this is a recurring series
  const recurrenceId = isRecurring ? randomUUID() : null

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
      space_id: target.type === 'space' ? Number(target.id) : null,
      recurrence_id: recurrenceId
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

export async function updateTask(taskId: string, updates: any, scope: 'single' | 'all_future' = 'single', recurrenceId?: string) {
  const supabase = await createClient()
  
  if (scope === 'single') {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        due_date: updates.date,
        date: updates.date
      })
      .eq('id', taskId)

    if (error) return { error: error.message }
  } else if (scope === 'all_future' && recurrenceId) {
    // 1. Fetch current task to get old date
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('due_date')
      .eq('id', taskId)
      .single()

    if (fetchError || !currentTask) return { error: 'Task not found' }

    // 2. Calculate delta days
    // Ensure we parse dates correctly (YYYY-MM-DD)
    const oldDateStr = currentTask.due_date.split('T')[0]
    const newDateStr = updates.date.split('T')[0]

    const oldDate = new Date(oldDateStr)
    const newDate = new Date(newDateStr)

    const diffTime = newDate.getTime() - oldDate.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    // 3. Fetch all future tasks in series (inclusive of current task)
    const { data: futureTasks, error: listError } = await supabase
      .from('tasks')
      .select('*')
      .eq('recurrence_id', recurrenceId)
      .gte('due_date', currentTask.due_date)

    if (listError) return { error: listError.message }
    if (!futureTasks || futureTasks.length === 0) return { success: true }

    // 4. Update each task
    const updatesPromises = futureTasks.map(task => {
      // Apply date shift
      const taskDate = new Date(task.due_date.split('T')[0]) // Parse local YYYY-MM-DD
      taskDate.setDate(taskDate.getDate() + diffDays)

      // Format back to YYYY-MM-DD
      // Use local parts to avoid UTC shifting issues
      // Since we parsed as local/UTC depending on browser, but here we run on Node.
      // new Date('YYYY-MM-DD') in Node is UTC.
      // So setDate works in UTC.
      // Then toISOString().split('T')[0] gives YYYY-MM-DD.
      const shiftedDateStr = taskDate.toISOString().split('T')[0]
      const shiftedDateFull = `${shiftedDateStr}T12:00:00` // Append noon

      return supabase.from('tasks').update({
        title: updates.title || task.title,
        description: updates.description !== undefined ? updates.description : task.description,
        due_date: shiftedDateFull,
        date: shiftedDateFull
      }).eq('id', task.id)
    })

    await Promise.all(updatesPromises)
  }

  revalidatePath('/')
  revalidatePath('/calendar')
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
