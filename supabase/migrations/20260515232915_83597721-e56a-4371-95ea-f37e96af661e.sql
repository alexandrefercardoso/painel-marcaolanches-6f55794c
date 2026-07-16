-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'DollarSign',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Simple policy for everyone to read
CREATE POLICY "Anyone can view active payment methods" 
ON public.payment_methods FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins can manage payment methods" 
ON public.payment_methods FOR ALL USING (true);

-- Insert initial values
INSERT INTO public.payment_methods (name, icon) VALUES 
('Dinheiro', 'Wallet'),
('Pix', 'ArrowRightLeft'),
('Cartão de Crédito', 'CreditCard'),
('Cartão de Débito', 'CreditCard'),
('Caderneta', 'Clock3')
ON CONFLICT DO NOTHING;