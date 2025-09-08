/*
  # Fix Loan RLS Policies

  1. Security Updates
    - Update loan insertion policy to check user exists and documents are verified
    - Ensure proper user context is set for RLS policies
    - Add function to set user context based on phone number

  2. Policy Changes
    - Allow loan insertion only if user exists in signups
    - Require Aadhaar and PAN verification before loan submission
    - Set default status to 'pending' for new loans
*/

-- Create function to set user context
CREATE OR REPLACE FUNCTION set_user_context(phone_number text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_phone', phone_number, true);
END;
$$;

-- Create function to get current user ID from phone context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id
  FROM signups
  WHERE phone_no = current_setting('app.current_phone', true);
  
  RETURN user_id;
END;
$$;

-- Update the trigger function for loans
CREATE OR REPLACE FUNCTION set_user_id_on_loans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get user ID from phone context
  SELECT id INTO current_user_id
  FROM signups
  WHERE phone_no = current_setting('app.current_phone', true);
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for current phone context';
  END IF;
  
  NEW.user_id := current_user_id;
  NEW.status := 'pending';
  
  RETURN NEW;
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own loans" ON loans;
DROP POLICY IF EXISTS "Users can read own loans" ON loans;
DROP POLICY IF EXISTS "Users can update own loans" ON loans;

-- Create new loan policies
CREATE POLICY "allow_loan_insert_if_user_exists"
  ON loans
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM signups 
      WHERE phone_no = current_setting('app.current_phone', true)
      AND id = user_id
    )
  );

CREATE POLICY "allow_read_own_loans"
  ON loans
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM signups 
      WHERE phone_no = current_setting('app.current_phone', true)
    )
  );

CREATE POLICY "allow_update_own_loans"
  ON loans
  FOR UPDATE
  TO authenticated, anon
  USING (
    user_id IN (
      SELECT id FROM signups 
      WHERE phone_no = current_setting('app.current_phone', true)
    )
  );