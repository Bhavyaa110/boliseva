/*
  # Create set_config RPC function

  1. New Functions
    - `set_config(parameter, value)` - Wrapper function for PostgreSQL's set_config
      - Allows setting session-level configuration parameters
      - Used for Row Level Security context (e.g., app.current_phone)
      - Returns void after setting the configuration

  2. Security
    - Function is accessible to authenticated and anonymous users
    - Required for RLS policies to work properly
*/

CREATE OR REPLACE FUNCTION public.set_config(parameter text, value text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config(parameter, value, true);
END;
$$;