import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const NOTIFY_EMAIL = "hugh@burkeroadpharmacy.com.au";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into waitlist
    const { error: insertError } = await supabase
      .from("waitlist_entries")
      .insert({ email: email.toLowerCase().trim() });

    if (insertError) {
      // Duplicate email
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ success: true, message: "You're already on the waitlist!" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw insertError;
    }

    // Send notification email via Lovable AI Gateway
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (apiKey) {
      try {
        // Use the AI gateway to compose a notification
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "user",
                content: `Generate a brief, professional plain-text notification email body (no subject line, just the body) for this event: A new person (${email}) just joined the ChemistCare Prescriber OS waitlist. Keep it to 2-3 sentences.`,
              },
            ],
            max_tokens: 150,
          }),
        });
        // Log the notification (we can't actually send email without a mail service)
        const aiResult = await response.json();
        console.log(`Waitlist notification for ${NOTIFY_EMAIL}:`, aiResult?.choices?.[0]?.message?.content);
      } catch (e) {
        console.error("AI notification error:", e);
      }
    }

    // Log the signup
    console.log(`New waitlist signup: ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "You're on the list! We'll be in touch." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Waitlist error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
