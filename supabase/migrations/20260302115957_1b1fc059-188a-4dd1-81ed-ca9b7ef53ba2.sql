
-- Waitlist entries table (public-facing, no auth required)
CREATE TABLE public.waitlist_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on email
ALTER TABLE public.waitlist_entries ADD CONSTRAINT waitlist_entries_email_unique UNIQUE (email);

-- Enable RLS
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public waitlist form)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist_entries
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read (admin viewing)
CREATE POLICY "Authenticated users can view waitlist"
  ON public.waitlist_entries
  FOR SELECT
  TO authenticated
  USING (true);
