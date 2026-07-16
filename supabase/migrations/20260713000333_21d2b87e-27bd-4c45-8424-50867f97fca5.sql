
CREATE TABLE public.whatsapp_bot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_bot_messages TO authenticated;
GRANT SELECT ON public.whatsapp_bot_messages TO anon;
GRANT ALL ON public.whatsapp_bot_messages TO service_role;

ALTER TABLE public.whatsapp_bot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bot_messages_all" ON public.whatsapp_bot_messages FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER trg_bot_messages_updated
BEFORE UPDATE ON public.whatsapp_bot_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.whatsapp_bot_messages (key, message) VALUES
  ('greeting_new', 'Olá! Seja bem-vindo(a) à {loja}. Como posso ajudar?'),
  ('greeting_returning', 'Olá {nome}, que bom te ver de novo!'),
  ('ask_delivery_type', 'Você prefere entrega ou retirada no local?'),
  ('ask_address', 'Por favor, informe seu endereço completo para entrega.'),
  ('delivery_saved_address', 'Confirma entrega no endereço: {endereco}?'),
  ('city_out_of_range', 'Desculpe, não entregamos em {cidade_loja} nesse endereço.'),
  ('menu_link', 'Aqui está nosso cardápio: {link}'),
  ('order_summary', 'Resumo do pedido:\n{itens}\nEndereço: {endereco}\nTaxa: {taxa}\nTotal: {total}'),
  ('order_confirmed', 'Pedido confirmado! Total: {total}. Obrigado!'),
  ('order_cancelled', 'Seu pedido foi cancelado.'),
  ('ask_payment_method', 'Qual a forma de pagamento?'),
  ('closed_store', 'No momento estamos fechados. Volte em nosso horário de atendimento.'),
  ('fallback', 'Desculpe, não entendi. Pode repetir?')
ON CONFLICT (key) DO NOTHING;
