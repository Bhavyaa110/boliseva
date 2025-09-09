CREATE OR REPLACE FUNCTION public.set_config(parameter text, value text)
RETURNS void AS $$
BEGIN
  EXECUTE format('SET app.%I = %L', parameter, value);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to both anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.set_config(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.set_config(text, text) TO authenticated;