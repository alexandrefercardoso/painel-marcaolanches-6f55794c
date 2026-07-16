-- Ensure printer_sectors table exists
CREATE TABLE IF NOT EXISTS public.printer_sectors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    printing_type TEXT DEFAULT 'complete',
    auto_print BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure printers table exists (it already does, but sector_id is missing the FK)
-- Add the foreign key constraint if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'printers_sector_id_fkey' 
        AND table_name = 'printers'
    ) THEN
        ALTER TABLE public.printers 
        ADD CONSTRAINT printers_sector_id_fkey 
        FOREIGN KEY (sector_id) 
        REFERENCES public.printer_sectors(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS and add GRANTS if needed (assuming based on standard patterns)
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO authenticated;
GRANT ALL ON public.printer_sectors TO service_role;

-- Policies for printer_sectors
CREATE POLICY "Allow authenticated users to manage their printer sectors"
ON public.printer_sectors
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
