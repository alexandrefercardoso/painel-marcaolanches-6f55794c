-- Add production_status and priority to table_order_items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_order_items' AND column_name = 'production_status') THEN
        ALTER TABLE public.table_order_items ADD COLUMN production_status TEXT DEFAULT 'new';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_order_items' AND column_name = 'priority') THEN
        ALTER TABLE public.table_order_items ADD COLUMN priority INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add production_status and priority to delivery_order_items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_order_items' AND column_name = 'production_status') THEN
        ALTER TABLE public.delivery_order_items ADD COLUMN production_status TEXT DEFAULT 'new';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_order_items' AND column_name = 'priority') THEN
        ALTER TABLE public.delivery_order_items ADD COLUMN priority INTEGER DEFAULT 0;
    END IF;
END $$;

-- Enable Realtime for these tables if not already enabled
-- Note: We wrap in a block to handle cases where the publication might not exist or table is already added
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'table_order_items') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.table_order_items;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'delivery_order_items') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_order_items;
        END IF;
    END IF;
END $$;