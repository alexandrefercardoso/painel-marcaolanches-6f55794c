ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{
  "monday": {"open": "18:00", "close": "23:00", "active": true},
  "tuesday": {"open": "18:00", "close": "23:00", "active": true},
  "wednesday": {"open": "18:00", "close": "23:00", "active": true},
  "thursday": {"open": "18:00", "close": "23:00", "active": true},
  "friday": {"open": "18:00", "close": "00:00", "active": true},
  "saturday": {"open": "18:00", "close": "00:00", "active": true},
  "sunday": {"open": "18:00", "close": "23:00", "active": true}
}'::jsonb,
ADD COLUMN IF NOT EXISTS auto_manage_menu BOOLEAN DEFAULT false;