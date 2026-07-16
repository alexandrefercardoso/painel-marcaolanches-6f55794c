
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS whatsapp_bot_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_api_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_api_key text,
  ADD COLUMN IF NOT EXISTS whatsapp_instance_name text;

CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone text NOT NULL,
  customer_name text,
  last_message text,
  status text NOT NULL DEFAULT 'em_andamento',
  unread_count integer NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_phone)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_conversations TO anon, authenticated;
GRANT ALL ON public.whatsapp_conversations TO service_role;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_conv_all" ON public.whatsapp_conversations FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  content text NOT NULL,
  sender text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO anon, authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wa_msg_all" ON public.whatsapp_messages FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS wa_msg_conv_idx ON public.whatsapp_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS wa_conv_updated_idx ON public.whatsapp_conversations(updated_at DESC);

DROP TRIGGER IF EXISTS trg_wa_conv_updated ON public.whatsapp_conversations;
CREATE TRIGGER trg_wa_conv_updated
BEFORE UPDATE ON public.whatsapp_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
