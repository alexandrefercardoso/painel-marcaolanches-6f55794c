import { supabase } from "@/integrations/supabase/client";

export interface PrintJobInput {
  printer_id: string;
  status: 'pending';
  copies: number;
  content: string;
}

export async function createPrintJob(job: PrintJobInput) {
  return await supabase.from("printing_jobs").insert([job as any]);
}
