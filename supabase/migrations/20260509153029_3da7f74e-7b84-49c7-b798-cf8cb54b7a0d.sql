-- Create the function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create cashier_sessions table
CREATE TABLE public.cashier_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE,
    opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    closing_balance DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_trips table
CREATE TABLE public.driver_trips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cashier_session_id UUID NOT NULL REFERENCES public.cashier_sessions(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id),
    trip_count INTEGER NOT NULL DEFAULT 1,
    fee_per_trip DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cashier_session_id to financial_transactions
ALTER TABLE public.financial_transactions 
ADD COLUMN cashier_session_id UUID REFERENCES public.cashier_sessions(id);

-- Enable RLS
ALTER TABLE public.cashier_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_trips ENABLE ROW LEVEL SECURITY;

-- Create policies (assuming admin access for all for now as per project pattern)
CREATE POLICY "Enable all for everyone" ON public.cashier_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for everyone" ON public.driver_trips FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cashier_sessions_updated_at
BEFORE UPDATE ON public.cashier_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();