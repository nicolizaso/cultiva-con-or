'use server';

import { createClient } from '@/app/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function bulkWaterPlants(
  plantIds: number[], 
  date: string, 
  notes: string
) {
  const supabase = await createClient();

  try {
    // 1. Crear los registros de Log (Bitácora) para CADA planta seleccionada
    const logsToInsert = plantIds.map(id => ({
      plant_id: id,
      type: 'Riego',
      title: 'Riego Masivo',
      notes: notes,
      created_at: date // Usamos la fecha que eligió el usuario
    }));

    const { error: logError } = await supabase
      .from('logs')
      .insert(logsToInsert);

    if (logError) throw logError;

    // 2. Actualizar el campo "last_water" en la tabla de plantas
    // (Para que en la tabla se vea "Hoy")
    const { error: plantError } = await supabase
      .from('plants')
      .update({ last_water: date.split('T')[0] }) // Guardamos solo YYYY-MM-DD
      .in('id', plantIds);

    if (plantError) throw plantError;

    // 3. Recargar la página para ver los cambios
    revalidatePath('/cycles/[id]', 'page');
    
    return { success: true };

  } catch (error) {
    console.error('Error en riego masivo:', error);
    return { error: 'Error al registrar el riego.' };
  }
}


export async function bulkChangeStage(
    plantIds: number[], 
    newStage: string,
    date: string,
    notes?: string
  ) {
    const supabase = await createClient();
  
    try {
      // 1. Crear logs para documentar el cambio
      const logsToInsert = plantIds.map(id => ({
        plant_id: id,
        type: 'Cambio de Etapa',
        title: `Cambio a ${newStage}`,
        notes: notes || `Cambio de etapa masivo registrado el ${date}`,
        created_at: date
      }));
  
      const { error: logError } = await supabase
        .from('logs')
        .insert(logsToInsert);
  
      if (logError) throw logError;
  
      // 2. Actualizar la etapa en las plantas
      const { error: plantError } = await supabase
        .from('plants')
        .update({ stage: newStage })
        .in('id', plantIds);
  
      if (plantError) throw plantError;
  
      revalidatePath('/cycles/[id]', 'page');
      return { success: true };
  
    } catch (error) {
      console.error('Error en cambio de etapa masivo:', error);
      return { error: 'Error al cambiar etapa.' };
    }
  }

  export async function addMeasurement(
    cycleId: number, 
    temperature: number, 
    humidity: number,
    date: string
  ) {
    const supabase = await createClient();
  
    try {
      const { error } = await supabase
        .from('measurements')
        .insert({
          cycle_id: cycleId,
          temperature,
          humidity,
          date
        });
  
      if (error) throw error;
  
      revalidatePath('/cycles/[id]', 'page');
      revalidatePath('/'); // También actualizamos el dashboard principal
      return { success: true };
  
    } catch (error) {
      console.error('Error al guardar medición:', error);
      return { error: 'Error al guardar medición' };
    }
  }