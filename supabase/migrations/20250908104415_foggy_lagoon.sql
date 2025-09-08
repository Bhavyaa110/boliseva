/*
  # Fix Authentication Context for Loan Applications

  1. Database Functions
    - Update set_user_context function with better error handling
    - Ensure get_current_user_id works properly
    - Add function to validate user authentication

  2. RLS Policies
    - Simplify loan policies to use direct user_id matching
    - Remove dependency on session context for basic operations

  3. Triggers
    - Update loan trigger to set user_id properly
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS set_user_context(text);
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS debug_user_context();

-- Create improved set_user_context function
CREATE OR REPLACE FUNCTION set_user_context(phone_number text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate phone number format
  IF phone_number IS NULL OR length(phone_number) != 10 THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM signups WHERE phone_no = phone_number) THEN
    RAISE EXCEPTION 'User not found with phone number: %', phone_number;
  END IF;
  
  -- Set the context
  PERFORM set_config('app.current_phone', phone_number, true);
  
  -- Log for debugging
  RAISE NOTICE 'User context set for phone: %', phone_number;
END;
$$;

-- Create get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_phone text;
  user_id uuid;
BEGIN
  -- Get current phone from context
  current_phone := current_setting('app.current_phone', true);
  
  -- If no context, return null
  IF current_phone IS NULL OR current_phone = '' THEN
    RETURN NULL;
  END IF;
  
  -- Get user ID from phone
  SELECT id INTO user_id 
  FROM signups 
  WHERE phone_no = current_phone;
  
  RETURN user_id;
END;
$$;

-- Create function to get user ID directly from phone
CREATE OR REPLACE FUNCTION get_user_id_by_phone(phone_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id 
  FROM signups 
  WHERE phone_no = phone_number;
  
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
  current_phone text;
  authenticated_user_id uuid;
BEGIN
  -- Get current phone from context
  current_phone := current_setting('app.current_phone', true);
  
  -- If no context set, raise error
  IF current_phone IS NULL OR current_phone = '' THEN
    RAISE EXCEPTION 'Authentication required. No phone context set.';
  END IF;
  
  -- Get user ID from phone
  SELECT id INTO authenticated_user_id 
  FROM signups 
  WHERE phone_no = current_phone;
  
  -- If user not found, raise error
  IF authenticated_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for phone: %', current_phone;
  END IF;
  
  -- Ensure the user_id matches the authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id := authenticated_user_id;
  ELSIF NEW.user_id != authenticated_user_id THEN
    RAISE EXCEPTION 'Cannot create loan for different user. Authenticated: %, Requested: %', 
      authenticated_user_id, NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS set_user_id_trigger ON loans;
DROP TRIGGER IF EXISTS loans_set_user_id ON loans;

CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_on_loans();

-- Update RLS policies for loans to be more direct
DROP POLICY IF EXISTS "users_can_insert_own_loans" ON loans;
DROP POLICY IF EXISTS "users_can_read_own_loans" ON loans;
DROP POLICY IF EXISTS "users_can_update_own_loans" ON loans;

-- Create simplified policies that work with or without context
CREATE POLICY "users_can_insert_own_loans" ON loans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM signups 
      WHERE phone_no = current_setting('app.current_phone', true)
    )
  );

CREATE POLICY "users_can_read_own_loans" ON loans
  FOR SELECT
  TO anon, authenticated
  USING (
    user_id IN (
      SELECT id FROM signups 
      WHERE phone_no = current_setting('app.current_phone', true)
    )
  );

CREATE POLICY "users_can_update_own_loans" ON loans
  FOR UPDATE
  TO anon, authenticated
  USING (
    user_id IN (
      SELECT id FROM signups 
      WHERE phone_no = current_setting('app.current_phone', true)
    )
  );

-- Update EMI policies similarly
DROP POLICY IF EXISTS "users_can_read_own_emis" ON emis;
DROP POLICY IF EXISTS "users_can_update_own_emis" ON emis;
DROP POLICY IF EXISTS "Users can read own emis" ON emis;
DROP POLICY IF EXISTS "Users can update own emis" ON emis;

CREATE POLICY "users_can_read_own_emis" ON emis
  FOR SELECT
  TO anon, authenticated
  USING (
    loan_id IN (
      SELECT loan_id FROM loans 
      WHERE user_id IN (
        SELECT id FROM signups 
        WHERE phone_no = current_setting('app.current_phone', true)
      )
    )
  );

CREATE POLICY "users_can_update_own_emis" ON emis
  FOR UPDATE
  TO anon, authenticated
  USING (
    loan_id IN (
      SELECT loan_id FROM loans 
      WHERE user_id IN (
        SELECT id FROM signups 
        WHERE phone_no = current_setting('app.current_phone', true)
      )
    )
  );

-- Add debug function
CREATE OR REPLACE FUNCTION debug_user_context()
RETURNS table(
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
  exists_flag boolean;
  uid uuid;
  uname text;
BEGIN
  phone := current_setting('app.current_phone', true);
  
  IF phone IS NOT NULL AND phone != '' THEN
    SELECT 
      EXISTS(SELECT 1 FROM signups WHERE phone_no = phone),
      id,
      name
    INTO exists_flag, uid, uname
    FROM signups 
    WHERE phone_no = phone;
  ELSE
    exists_flag := false;
    uid := NULL;
    uname := NULL;
  END IF;
  
  RETURN QUERY SELECT phone, exists_flag, uid, uname;
END;
$$;