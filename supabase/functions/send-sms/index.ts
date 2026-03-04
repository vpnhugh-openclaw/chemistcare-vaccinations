import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return new Response(
        JSON.stringify({ error: "Twilio credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { patientName, patientPhone, messageType, consultId, customMessage } = await req.json();

    if (!patientPhone || !patientName) {
      return new Response(
        JSON.stringify({ error: "patientPhone and patientName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check consent
    const { data: consent } = await supabase
      .from("patient_sms_consent")
      .select("opted_in")
      .eq("patient_phone", patientPhone)
      .maybeSingle();

    if (consent && !consent.opted_in) {
      return new Response(
        JSON.stringify({ error: "Patient has opted out of SMS" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build message based on type
    let messageBody: string;
    const type = messageType || "pre_screen";

    if (customMessage) {
      messageBody = customMessage;
    } else if (type === "pre_screen") {
      messageBody = `Hi ${patientName}, prepare for your consult at Burke Road Pharmacy.\n\nPlease complete your pre-screening questionnaire:\nhttps://forms.gle/YOUR_FORM_ID\n\nThis helps us provide the best care.\n\nReply STOP to opt-out.\n— ChemistCare`;
    } else if (type === "follow_up") {
      messageBody = `Hi ${patientName}, how did your consult go? Rate 1-5 (1=poor, 5=excellent).\n\nAny issues? Reply or call (03) XXXX XXXX.\n\nThanks, ChemistCare\nReply STOP to unsubscribe.`;
    } else {
      messageBody = `Hi ${patientName}, this is a message from ChemistCare.\n\nReply STOP to opt-out.`;
    }

    // Send via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const formData = new URLSearchParams();
    formData.append("To", patientPhone);
    formData.append("From", TWILIO_PHONE_NUMBER);
    formData.append("Body", messageBody);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioData);
      // Log the failed attempt
      await supabase.from("sms_messages").insert({
        patient_name: patientName,
        patient_phone: patientPhone,
        message_type: type,
        message_body: messageBody,
        status: "failed",
        direction: "outbound",
        consult_id: consultId || null,
        created_by: userId,
      });

      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: twilioData.message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful send
    await supabase.from("sms_messages").insert({
      patient_name: patientName,
      patient_phone: patientPhone,
      message_type: type,
      message_body: messageBody,
      twilio_sid: twilioData.sid,
      status: twilioData.status || "queued",
      direction: "outbound",
      consult_id: consultId || null,
      created_by: userId,
    });

    // Upsert consent record (if first contact)
    if (!consent) {
      await supabase.from("patient_sms_consent").upsert(
        {
          patient_phone: patientPhone,
          patient_name: patientName,
          opted_in: true,
          consent_source: type === "pre_screen" ? "booking_form" : "consult_followup",
        },
        { onConflict: "patient_phone" }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        twilioSid: twilioData.sid,
        status: twilioData.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-sms error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
