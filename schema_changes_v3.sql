-- Add recurrence_id to tasks for Smart Edit feature
ALTER TABLE tasks ADD COLUMN recurrence_id UUID;
