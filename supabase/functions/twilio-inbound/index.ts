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
    // Twilio sends webhooks as application/x-www-form-urlencoded
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = (formData.get("Body") as string || "").trim();
    const messageSid = formData.get("MessageSid") as string;

    if (!from || !body) {
      return new Response("<Response></Response>", {
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const upperBody = body.toUpperCase();

    // Handle STOP opt-out
    if (["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(upperBody)) {
      await supabase
        .from("patient_sms_consent")
        .update({ opted_in: false, opted_out_at: new Date().toISOString() })
        .eq("patient_phone", from);

      // Log inbound
      await supabase.from("sms_messages").insert({
        patient_name: "Unknown",
        patient_phone: from,
        message_type: "opt_out",
        message_body: body,
        status: "received",
        direction: "inbound",
        twilio_sid: messageSid,
      });

      // TwiML response confirming opt-out
      return new Response(
        `<Response><Message>You have been unsubscribed from ChemistCare SMS. You will no longer receive messages. Reply START to re-subscribe.</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // Handle START opt-in
    if (["START", "YES", "UNSTOP"].includes(upperBody)) {
      await supabase
        .from("patient_sms_consent")
        .update({ opted_in: true, opted_in_at: new Date().toISOString(), opted_out_at: null })
        .eq("patient_phone", from);

      await supabase.from("sms_messages").insert({
        patient_name: "Unknown",
        patient_phone: from,
        message_type: "opt_in",
        message_body: body,
        status: "received",
        direction: "inbound",
        twilio_sid: messageSid,
      });

      return new Response(
        `<Response><Message>You have been re-subscribed to ChemistCare SMS. Reply STOP to opt-out at any time.</Message></Response>`,
        { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // Parse rating (1-5)
    let rating: number | null = null;
    const ratingMatch = body.match(/^([1-5])$/);
    if (ratingMatch) {
      rating = parseInt(ratingMatch[1], 10);
    }

    // Find most recent outbound message to this phone to attach the response
    const { data: lastMsg } = await supabase
      .from("sms_messages")
      .select("id, patient_name")
      .eq("patient_phone", from)
      .eq("direction", "outbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const patientName = lastMsg?.patient_name || "Unknown";

    // Update the last outbound message with the response
    if (lastMsg) {
      await supabase
        .from("sms_messages")
        .update({
          response_text: body,
          ...(rating ? { response_rating: rating } : {}),
        })
        .eq("id", lastMsg.id);
    }

    // Also log the inbound message as a separate record
    await supabase.from("sms_messages").insert({
      patient_name: patientName,
      patient_phone: from,
      message_type: rating ? "rating" : "reply",
      message_body: body,
      status: "received",
      direction: "inbound",
      twilio_sid: messageSid,
      response_rating: rating,
      response_text: body,
    });

    // Acknowledge
    const replyText = rating
      ? `Thanks for your feedback! You rated your consult ${rating}/5. We appreciate your input. — ChemistCare`
      : `Thanks for your reply. A pharmacist will review your message shortly. — ChemistCare`;

    return new Response(
      `<Response><Message>${replyText}</Message></Response>`,
      { headers: { ...corsHeaders, "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("twilio-inbound error:", error);
    return new Response("<Response></Response>", {
      headers: { ...corsHeaders, "Content-Type": "text/xml" },
    });
  }
});
