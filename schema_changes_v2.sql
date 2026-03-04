-- Add new columns for enhanced plant tracking
ALTER TABLE plants
ADD COLUMN strain text NOT NULL DEFAULT 'Unknown',
ADD COLUMN breeder text,
ADD COLUMN source_type text CHECK (source_type IN ('Semilla', 'Esqueje')),
ADD COLUMN mother_id int REFERENCES plants(id);
