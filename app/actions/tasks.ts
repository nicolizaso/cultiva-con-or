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

  const recurrenceId = isRecurring ? randomUUID() : null

  // 1. Resolve Target Metadata (cycle_id and linked plants)
  const targetInfos = await Promise.all(targets.map(async (target: any) => {
    let cycleId: number | null = null;
    let linkedPlantIds: number[] = [];

    if (target.type === 'plant') {
      const { data: plant } = await supabase.from('plants').select('cycle_id').eq('id', target.id).single();
      cycleId = plant?.cycle_id;
      linkedPlantIds = [Number(target.id)];
    } else if (target.type === 'space') {
      const { data: cycle } = await supabase.from('cycles').select('id').eq('space_id', target.id).eq('is_active', true).single();
      cycleId = cycle?.id || null;

      if (cycleId) {
        const { data: plants } = await supabase.from('plants').select('id').eq('space_id', target.id).eq('cycle_id', cycleId);
        linkedPlantIds = plants?.map((p: any) => p.id) || [];
      } else {
         // Fallback: plants in space
         const { data: plants } = await supabase.from('plants').select('id').eq('space_id', target.id);
         linkedPlantIds = plants?.map((p: any) => p.id) || [];
      }
    }
    return { target, cycleId, linkedPlantIds };
  }));

  // 2. Generate and Insert Tasks per Target
  for (const { target, cycleId, linkedPlantIds } of targetInfos) {
      let datesToInsert: string[] = [];

      if (isRecurring && endDate) {
          const startDateObj = new Date(date);
          const endDateObj = new Date(endDate);
          let current = new Date(startDateObj);
          let count = 0;
          const maxIterations = 50;

          while (current <= endDateObj && count < maxIterations) {
              const year = current.getFullYear();
              const month = String(current.getMonth() + 1).padStart(2, '0');
              const day = String(current.getDate()).padStart(2, '0');
              datesToInsert.push(`${year}-${month}-${day}T12:00:00`);

              switch (frequency) {
                  case 'daily': current.setDate(current.getDate() + 1); break;
                  case 'every2days': current.setDate(current.getDate() + 2); break;
                  case 'weekly': current.setDate(current.getDate() + 7); break;
                  case 'biweekly': current.setDate(current.getDate() + 14); break;
                  case 'monthly': current.setMonth(current.getMonth() + 1); break;
                  default: current.setDate(current.getDate() + 1);
              }
              count++;
          }
      } else {
          // Ensure consistent T12:00:00 format for single dates too
          const d = date.includes('T') ? date : `${date}T12:00:00`;
          datesToInsert.push(d);
      }

      const tasksData = datesToInsert.map(d => ({
          user_id: user.id,
          title: title,
          description: description || null,
          due_date: d,
          date: d, // Keep for compatibility
          type: taskType.id,
          status: 'pending',
          plant_id: target.type === 'plant' ? Number(target.id) : null,
          space_id: target.type === 'space' ? Number(target.id) : null,
          recurrence_id: recurrenceId,
          cycle_id: cycleId
      }));

      const { data: insertedTasks, error } = await supabase.from('tasks').insert(tasksData).select('id');
      if (error) return { error: error.message };

      if (linkedPlantIds.length > 0 && insertedTasks) {
          const taskPlantsData = [];
          for (const task of insertedTasks) {
              for (const plantId of linkedPlantIds) {
                  taskPlantsData.push({
                      task_id: task.id,
                      plant_id: plantId
                  });
              }
          }
          if (taskPlantsData.length > 0) {
              const { error: tpError } = await supabase.from('task_plants').insert(taskPlantsData);
              if (tpError) console.error('Error linking task_plants:', tpError);
          }
      }
  }

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

  if (newStatus === 'completed') {
    const { data: task } = await supabase
      .from('tasks')
      .select(`
        *,
        task_plants (
          plant_id,
          plants ( id, cycle_id )
        )
      `)
      .eq('id', taskId)
      .single()

    if (task && task.task_plants && task.task_plants.length > 0) {
      const logsToInsert = task.task_plants.map((tp: any) => ({
        plant_id: tp.plant_id,
        cycle_id: tp.plants?.cycle_id || task.cycle_id,
        type: task.type,
        title: task.title,
        notes: task.description,
        created_at: new Date().toISOString()
      }))

      const { error: logError } = await supabase.from('logs').insert(logsToInsert)
      if (logError) console.error('Error creating logs:', logError)

      if (task.type === 'riego') {
        const plantIds = task.task_plants.map((tp: any) => tp.plant_id)
        const { error: waterError } = await supabase
          .from('plants')
          .update({ last_water: new Date().toISOString() })
          .in('id', plantIds)

        if (waterError) console.error('Error updating last_water:', waterError)
      }
    }
  }

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

export async function getAllPendingTasks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const [tasksResult, cyclesResult] = await Promise.all([
     supabase
      .from('tasks')
      .select('*, plants(id, name, cycle_id, cycles(id, name))')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true }),
     supabase
      .from('cycles')
      .select('id, name')
      .eq('is_active', true)
  ])

  if (tasksResult.error) return { error: tasksResult.error.message }
  if (cyclesResult.error) return { error: cyclesResult.error.message }

  // Map tasks to flatten cycleName
  const tasks = tasksResult.data.map((t: any) => {
    // If connected via plant
    let cycleName = t.plants?.cycles?.name
    let cycleId = t.plants?.cycles?.id

    return {
      ...t,
      cycleName,
      cycleId
    }
  })

  return { tasks, cycles: cyclesResult.data }
}
