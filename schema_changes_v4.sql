-- Upgrade to support Cycle Gallery (reusing logs table)

-- 1. Ensure plant_id is nullable to support cycle-only logs
ALTER TABLE logs ALTER COLUMN plant_id DROP NOT NULL;

-- 2. Ensure cycle_id exists (it likely does, but for completeness)
-- ALTER TABLE logs ADD COLUMN IF NOT EXISTS cycle_id BIGINT REFERENCES cycles(id) ON DELETE CASCADE;

-- 3. RLS Policies
-- If logs table relies on plant ownership, we need to ensure it also checks cycle ownership.
-- Example policy (adjust based on actual existing policies):
-- CREATE POLICY "Users can insert logs for their cycles" ON logs FOR INSERT
-- WITH CHECK (
--   auth.uid() IN (
--     SELECT user_id FROM cycles WHERE id = cycle_id
--   )
-- );

-- CREATE POLICY "Users can view logs for their cycles" ON logs FOR SELECT
-- USING (
--   auth.uid() IN (
--     SELECT user_id FROM cycles WHERE id = cycle_id
--   )
-- );
