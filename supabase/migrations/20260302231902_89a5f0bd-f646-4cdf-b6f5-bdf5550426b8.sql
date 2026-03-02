
ALTER TABLE public.waitlist_entries
ADD COLUMN role text DEFAULT NULL,
ADD COLUMN pharmacy_name text DEFAULT NULL;
