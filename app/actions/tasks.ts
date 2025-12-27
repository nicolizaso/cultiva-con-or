'use server'

import { createClient } from "@/app/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createTask(formData: any) {
  const supabase = await createClient()
  
  // 1. Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para crear tareas.' }

  const { targets, taskType, date, description, otherText } = formData

  if (!targets || targets.length === 0) {
    return { error: 'Debes seleccionar al menos una planta o espacio.' }
  }

  // 2. Definir el título
  const title = taskType.id === 'otro' ? otherText : taskType.label

  if (!title) return { error: 'La tarea debe tener un nombre.' }

  // 3. Preparar los datos
  const tasksToInsert = targets.map((target: any) => ({
    user_id: user.id,
    title: title,
    description: description || null,
    
    // CORRECCIÓN CRÍTICA: Enviamos la fecha a 'due_date' (que es la obligatoria en tu DB)
    // Mantenemos 'date' también por si tu tabla tiene ambas columnas.
    due_date: date, 
    date: date,
    
    type: taskType.id, // Esto ahora es texto libre gracias al SQL anterior
    status: 'pending',
    
    plant_id: target.type === 'plant' ? Number(target.id) : null,
    space_id: target.type === 'space' ? Number(target.id) : null
  }))

  // 4. Insertar en DB
  const { error } = await supabase.from('tasks').insert(tasksToInsert)

  if (error) {
    console.error('Error creando tarea:', error)
    // Mensaje de error amigable
    return { error: `Error de base de datos: ${error.message}` }
  }

  // 5. Actualizar la vista
  revalidatePath('/')
  revalidatePath('/calendar')
  
  return { success: true }
}