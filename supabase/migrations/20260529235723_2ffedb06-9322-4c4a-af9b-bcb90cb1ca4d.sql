-- Ensure printing_jobs table has ON DELETE CASCADE for printer_id
ALTER TABLE public.printing_jobs 
DROP CONSTRAINT IF EXISTS printing_jobs_printer_id_fkey;

ALTER TABLE public.printing_jobs 
ADD CONSTRAINT printing_jobs_printer_id_fkey 
FOREIGN KEY (printer_id) REFERENCES public.printers(id) 
ON DELETE CASCADE;

-- Ensure print_jobs table has ON DELETE CASCADE for printer_id
ALTER TABLE public.print_jobs 
DROP CONSTRAINT IF EXISTS print_jobs_printer_id_fkey;

ALTER TABLE public.print_jobs 
ADD CONSTRAINT print_jobs_printer_id_fkey 
FOREIGN KEY (printer_id) REFERENCES public.printers(id) 
ON DELETE CASCADE;

-- Grant permissions (just in case)
GRANT ALL ON public.printing_jobs TO authenticated, service_role;
GRANT ALL ON public.print_jobs TO authenticated, service_role;
GRANT ALL ON public.printers TO authenticated, service_role;
