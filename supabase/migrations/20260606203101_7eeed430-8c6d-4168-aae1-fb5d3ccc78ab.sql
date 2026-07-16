-- Adicionar configurações de impressão na loja
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS table_print_mode TEXT DEFAULT 'immediate' CHECK (table_print_mode IN ('immediate', 'grouped')),
ADD COLUMN IF NOT EXISTS print_item_separately BOOLEAN DEFAULT true;

-- Adicionar auto-impressão via navegador nas impressoras
ALTER TABLE public.printers
ADD COLUMN IF NOT EXISTS auto_browser_print BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.store_settings.table_print_mode IS 'Define se o pedido da mesa imprime item a item ou aguarda o fechamento do lançamento';
COMMENT ON COLUMN public.store_settings.print_item_separately IS 'Se true, imprime um cupom para cada item individual';
COMMENT ON COLUMN public.printers.auto_browser_print IS 'Se true, o monitor do navegador tentará disparar window.print() automaticamente para jobs desta impressora';
