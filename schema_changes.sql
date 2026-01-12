-- 1. Add planted_at column
-- We default to NOW() for new entries.
ALTER TABLE plants
ADD COLUMN planted_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Backfill existing data
-- We estimate the planted_at date by subtracting the existing 'days' count from the current time.
UPDATE plants
SET planted_at = NOW() - (days || ' days')::INTERVAL
WHERE days IS NOT NULL AND days > 0;

-- 3. Create a computed column function for current_age_days
-- This function takes a row from the plants table and returns the age in days.
-- It works by converting both timestamps to dates (to ignore time of day) and finding the difference.
-- This creates a 'virtual field' that can be queried via the API.
CREATE OR REPLACE FUNCTION current_age_days(plant_row plants)
RETURNS INTEGER AS $$
BEGIN
  -- We cast to DATE to compare calendar days, avoiding issues with time-of-day.
  -- CURRENT_DATE uses the server's timezone.
  RETURN (CURRENT_DATE - plant_row.planted_at::DATE);
END;
$$ LANGUAGE plpgsql STABLE;
