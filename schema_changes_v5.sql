-- Create cycle_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS cycle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id BIGINT REFERENCES cycles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    taken_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    description TEXT
);

-- Ensure description column exists (idempotent)
ALTER TABLE cycle_images ADD COLUMN IF NOT EXISTS description TEXT;

-- Index for faster retrieval by cycle_id
CREATE INDEX IF NOT EXISTS idx_cycle_images_cycle_id ON cycle_images(cycle_id);

-- RLS Policies (Assuming basic auth required)
ALTER TABLE cycle_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their cycle images" ON cycle_images
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM cycles WHERE id = cycle_images.cycle_id));

CREATE POLICY "Users can insert their cycle images" ON cycle_images
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM cycles WHERE id = cycle_images.cycle_id));

CREATE POLICY "Users can update their cycle images" ON cycle_images
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM cycles WHERE id = cycle_images.cycle_id));

CREATE POLICY "Users can delete their cycle images" ON cycle_images
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM cycles WHERE id = cycle_images.cycle_id));
