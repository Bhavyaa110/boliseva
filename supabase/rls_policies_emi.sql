-- Enable Row Level Security on emis table
ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own EMIs
CREATE POLICY "Users can read own emis" ON public.emis
FOR SELECT
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.loans WHERE loan_id = emis.loan_id));

-- Policy: Allow insert EMIs (admin can insert for users)
CREATE POLICY "Allow insert emis" ON public.emis
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Users can UPDATE their own EMIs
CREATE POLICY "Users can update own emis" ON public.emis
FOR UPDATE
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.loans WHERE loan_id = emis.loan_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.loans WHERE loan_id = emis.loan_id));
