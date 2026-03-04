
-- SMS message log table
CREATE TABLE public.sms_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'pre_screen',
  message_body TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  direction TEXT NOT NULL DEFAULT 'outbound',
  consult_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  response_text TEXT,
  response_rating INTEGER,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Patient SMS consent tracking
CREATE TABLE public.patient_sms_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_phone TEXT NOT NULL,
  patient_name TEXT,
  opted_in BOOLEAN NOT NULL DEFAULT true,
  opted_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opted_out_at TIMESTAMP WITH TIME ZONE,
  consent_source TEXT DEFAULT 'booking_form',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_phone)
);

-- Enable RLS
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_sms_consent ENABLE ROW LEVEL SECURITY;

-- RLS policies for sms_messages
CREATE POLICY "Authenticated users can manage sms_messages" ON public.sms_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS policies for patient_sms_consent
CREATE POLICY "Authenticated users can manage patient_sms_consent" ON public.patient_sms_consent FOR ALL TO authenticated USING (true) WITH CHECK (true);
