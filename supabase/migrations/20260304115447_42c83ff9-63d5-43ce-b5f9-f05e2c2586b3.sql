
-- ============================================================
-- Tighten RLS write policies for consultations (has created_by)
-- ============================================================

-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Users can manage own consultations" ON public.consultations;

-- Keep the existing SELECT policy (read all is fine for single-pharmacy)
-- Add scoped INSERT policy
CREATE POLICY "Users can insert own consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Add scoped UPDATE policy
CREATE POLICY "Users can update own consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Add scoped DELETE policy
CREATE POLICY "Users can delete own consultations"
  ON public.consultations FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================================
-- Tighten RLS write policies for sms_messages (has created_by)
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can manage sms_messages" ON public.sms_messages;

-- Keep read access for all authenticated users
CREATE POLICY "Authenticated users can read sms_messages"
  ON public.sms_messages FOR SELECT
  TO authenticated
  USING (true);

-- Scoped INSERT
CREATE POLICY "Users can insert own sms_messages"
  ON public.sms_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Scoped UPDATE
CREATE POLICY "Users can update own sms_messages"
  ON public.sms_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Scoped DELETE
CREATE POLICY "Users can delete own sms_messages"
  ON public.sms_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
