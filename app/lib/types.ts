export interface Plant {
    id: number;
    name: string;
    stage: string;
    days: number;
    last_water: string;
    cycle_id: number | null; // Nuevo campo
    image_url?: string;
  }
  
  export interface Cycle {
    id: number;
    name: string;
    start_date: string;
    is_active: boolean;
    space_id: number;
  }
  
  export interface Space {
    id: number;
    name: string;
    type: 'Indoor' | 'Outdoor' | 'Mixto';
  }