/*
  # Update signups table structure

  1. Changes
    - Remove bank_no column from signups table (no longer needed)
    - Keep all other fields intact
    - Maintain existing RLS policies and indexes

  2. Security
    - All existing RLS policies remain unchanged
    - No impact on user data access patterns
*/

-- Remove bank_no column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'signups' AND column_name = 'bank_no'
  ) THEN
    ALTER TABLE signups DROP COLUMN bank_no;
  END IF;
END $$;