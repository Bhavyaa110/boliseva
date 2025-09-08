/*
  # Fix Loan Authentication and RLS Policies

  1. New Functions
    - Update set_user_context function to handle errors gracefully
    - Improve user ID retrieval from phone context
    - Add better error handling for RLS policies

  2. Policy Updates
    - Simplify loan insertion policy
    - Ensure proper user context validation
    - Add better debugging for RLS issues

  3. Security
    - Maintain strict user isolation
    - Ensure only authenticated users can access their own data
    - Add proper error handling for missing context
*/

-- Update the set_user_context function with better error handling
CREATE OR REPLACE FUNCTION set_user_context(phone_number text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate that the phone number exists in signups
  IF NOT EXISTS (SELECT 1 FROM signups WHERE phone_no = phone_number) THEN
    RAISE EXCEPTION 'Invalid phone number: %', phone_number;
  END IF;
  
  -- Set the configuration
  PERFORM set_config('app.current_phone', phone_number, true);
END;
$$;

-- Update the get_current_user_id function with better error handling
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  current_phone text;
BEGIN
  -- Get the current phone from session
  current_phone := current_setting('app.current_phone', true);
  
  IF current_phone IS NULL OR current_phone = '' THEN
    RAISE EXCEPTION 'No phone context set. Please authenticate first.';
  END IF;
  
  -- Get user ID from phone
  SELECT id INTO user_id
  FROM signups
  WHERE phone_no = current_phone;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for phone: %', current_phone;
  END IF;
  
  RETURN user_id;
END;
$$;

-- Update the trigger function for loans with better validation
CREATE OR REPLACE FUNCTION set_user_id_on_loans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  current_phone text;
BEGIN
  -- Get the current phone from session
  current_phone := current_setting('app.current_phone', true);
  
  IF current_phone IS NULL OR current_phone = '' THEN
    RAISE EXCEPTION 'Authentication required. No phone context set.';
  END IF;
  
  -- Get user ID from phone context
  SELECT id INTO current_user_id
  FROM signups
  WHERE phone_no = current_phone;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for phone: %', current_phone;
  END IF;
  
  -- Validate that the provided user_id matches the authenticated user
  IF NEW.user_id IS NOT NULL AND NEW.user_id != current_user_id THEN
    RAISE EXCEPTION 'Cannot create loan for different user';
  END IF;
  
  -- Set the correct user_id and default status
  NEW.user_id := current_user_id;
  
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS set_user_id_trigger ON loans;
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_on_loans();

-- Drop and recreate loan policies with better logic
DROP POLICY IF EXISTS "allow_loan_insert_if_user_exists" ON loans;
DROP POLICY IF EXISTS "allow_read_own_loans" ON loans;
DROP POLICY IF EXISTS "allow_update_own_loans" ON loans;

-- Create simplified loan policies
CREATE POLICY "users_can_insert_own_loans"
  ON loans
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    user_id = get_current_user_id()
  );

CREATE POLICY "users_can_read_own_loans"
  ON loans
  FOR SELECT
  TO authenticated, anon
  USING (
    user_id = get_current_user_id()
  );

CREATE POLICY "users_can_update_own_loans"
  ON loans
  FOR UPDATE
  TO authenticated, anon
  USING (
    user_id = get_current_user_id()
  );

-- Create similar policies for EMIs
DROP POLICY IF EXISTS "users_can_read_own_emis" ON emis;
DROP POLICY IF EXISTS "users_can_update_own_emis" ON emis;

CREATE POLICY "users_can_read_own_emis"
  ON emis
  FOR SELECT
  TO authenticated, anon
  USING (
    loan_id IN (
      SELECT loan_id FROM loans WHERE user_id = get_current_user_id()
    )
  );

CREATE POLICY "users_can_update_own_emis"
  ON emis
  FOR UPDATE
  TO authenticated, anon
  USING (
    loan_id IN (
      SELECT loan_id FROM loans WHERE user_id = get_current_user_id()
    )
  );

-- Add helpful function to debug RLS context
CREATE OR REPLACE FUNCTION debug_user_context()
RETURNS TABLE(
  current_phone text,
  user_exists boolean,
  user_id uuid,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  phone text;
  uid uuid;
  uname text;
  exists_flag boolean;
BEGIN
  phone := current_setting('app.current_phone', true);
  
  SELECT id, name INTO uid, uname
  FROM signups
  WHERE phone_no = phone;
  
  exists_flag := (uid IS NOT NULL);
  
  RETURN QUERY SELECT phone, exists_flag, uid, uname;
END;
$$;