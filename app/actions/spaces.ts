"use server";

import { createClient } from "@/app/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { Space } from "@/app/lib/types";

export async function updateSpace(id: number, data: Partial<Space>) {
  const supabase = await createClient();

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  // Exclude fields that shouldn't be manually updated or are read-only
  // cycleCount is likely a computed view or relation count, usually not a column to update.
  const { id: _id, cycleCount, ...updates } = data;

  try {
    const { error } = await supabase
      .from("spaces")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating space:", error);
      return { success: false, error: "Error al actualizar el espacio" };
    }

    revalidatePath("/spaces");
    return { success: true };
  } catch (error) {
    console.error("Error in updateSpace:", error);
    return { success: false, error: "Error inesperado" };
  }
}
