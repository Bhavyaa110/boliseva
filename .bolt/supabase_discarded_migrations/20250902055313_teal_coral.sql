/*
  # Create set_config RPC function

  1. New Functions
    - `set_config(parameter text, value text)`
      - Sets session-level configuration variables
      - Used for Row Level Security context (e.g., current phone number)
      - Returns void

  2. Security
    - Grant EXECUTE permission to anon and authenticated roles
    - Required for RLS policies that use session variables

  3. Purpose
    - Enables the application to set `app.current_phone` for RLS policies
    - Allows secure data access based on user context
*/

CREATE OR REPLACE FUNCTION public.set_config(parameter text, value text)
RETURNS void AS $$
BEGIN
  EXECUTE format('SET app.%I = %L', parameter, value);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to both anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.set_config(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.set_config(text, text) TO authenticated;