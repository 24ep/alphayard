-- Alter circles type column to allow any string (not just predefined values)
-- This allows dynamic house types to be used

-- Drop the old constraint if it exists
ALTER TABLE circles DROP CONSTRAINT IF EXISTS circles_type_check;

-- Update the type column to be a simple VARCHAR without constraint
-- The type will now be linked to house_types via house_type_id or stored as the code directly
COMMENT ON COLUMN circles.type IS 'The type/code of the house type (e.g., hourse, workplace, friend)';

-- Also ensure created_by column exists (some tables may not have it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'circles' AND column_name = 'created_by') THEN
        ALTER TABLE circles ADD COLUMN created_by UUID REFERENCES users(id);
        -- Backfill with owner_id if available
        UPDATE circles SET created_by = owner_id WHERE created_by IS NULL;
    END IF;
END $$;
