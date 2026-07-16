-- Enable RLS for financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Manage financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow public read transactions" ON public.financial_transactions;

-- Create full permissive policy for anyone to manage financial transactions
CREATE POLICY "Manage financial transactions" ON public.financial_transactions
FOR ALL
USING (true)
WITH CHECK (true);