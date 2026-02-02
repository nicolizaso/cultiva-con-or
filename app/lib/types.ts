export type CycleStage = 
  | 'Germinación' 
  | 'Plántula' 
  | 'Vegetativo' 
  | 'Floración' 
  | 'Secado' 
  | 'Curado';

export interface Plant {
  id: number;
  name: string;
  stage: string;
  days?: number; // Deprecated: Use current_age_days instead
  planted_at?: string; // ISO timestamp
  current_age_days?: number; // Computed field
  last_water: string;
  cycle_id: number | null;
  image_url?: string;
  strain?: string;
  breeder?: string;
  source_type?: 'Semilla' | 'Esqueje';
  mother_id?: number | null;
}

export interface Cycle {
  id: number;
  name: string;
  start_date: string;
  is_active: boolean;
  space_id: number;
  stage?: CycleStage; // Opcional por si no lo usas aún
}

export interface Space {
  id: number;
  name: string;
  type: 'Indoor' | 'Outdoor' | 'Mixto';
  cycleCount?: number;
}

// ESTA ES LA INTERFAZ QUE FALTABA:
export interface Task {
  id: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  completed?: boolean;
  status?: 'pending' | 'completed';
  cycleId?: string;
  cycleName?: string;
  type: string; // 'riego', 'poda', etc.
}