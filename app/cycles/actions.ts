'use server';

import { createClient } from '@/app/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { formatDateShort } from '@/app/lib/utils';

export async function bulkWaterPlants(
  plantIds: number[], 
  date: string, 
  notes: string,
  cycleId: number
) {
  const supabase = await createClient();

  try {
    // 1. Crear UN registro de Log (Bitácora) para la acción masiva
    const count = plantIds.length;
    const title = `Riego masivo aplicado a ${count} plantas`;

    // Notes can include the date formatted
    const formattedDate = formatDateShort(date);
    const finalNotes = notes ? `${notes}\nFecha: ${formattedDate}` : `Fecha: ${formattedDate}`;

    const { error: logError } = await supabase
      .from('logs')
      .insert({
        cycle_id: cycleId, // Link to cycle
        plant_id: null,    // Not linked to specific plant
        type: 'Riego',
        title: title,
        notes: finalNotes,
        created_at: date
      });

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
    cycleId: number,
    notes?: string
  ) {
    const supabase = await createClient();
  
    try {
      // 1. Crear UN log para documentar el cambio
      const count = plantIds.length;
      const formattedDate = formatDateShort(date);

      const { error: logError } = await supabase
        .from('logs')
        .insert({
            cycle_id: cycleId,
            plant_id: null,
            type: 'Cambio de Etapa',
            title: `Cambio de etapa a ${newStage} para ${count} plantas`,
            notes: notes || `Cambio de etapa masivo registrado el ${formattedDate}`,
            created_at: date
        });
  
      if (logError) throw logError;
  
      // 2. Actualizar la etapa en las plantas Y stage_updated_at
      const { error: plantError } = await supabase
        .from('plants')
        .update({
            stage: newStage,
            stage_updated_at: date // Use the provided date
        })
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
