import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PPA_URLS = {
  sandbox: {
    api: "https://sandbox-api.ppaonline.com.au/api/Public/v1.0",
    sso: "https://sandbox-sso.ppaonline.com.au/api/Public/v1.0",
  },
  production: {
    api: "https://api.ppaonline.com.au/api/Public/v1.0",
    sso: "https://sso.ppaonline.com.au/api/Public/v1.0",
  },
};

interface PPASettings {
  ppa_service_provider_id: string | null;
  ppa_user_id: string | null;
  environment: "sandbox" | "production";
}

async function getAuthToken(
  ssoUrl: string,
  apiKey: string,
  userId: string
): Promise<string> {
  const res = await fetch(`${ssoUrl}/Authorise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ApiKey: apiKey, UserId: userId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PPA SSO auth failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.Token || data.token;
}

async function ppaApiCall(
  apiUrl: string,
  token: string,
  path: string,
  method = "GET",
  body?: unknown
) {
  const res = await fetch(`${apiUrl}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const responseText = await res.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { raw: responseText };
  }
  return { status: res.status, ok: res.ok, data: responseData };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getUser();
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.user.id;

    const body = await req.json();
    const { action } = body;

    // Get PPA settings
    const { data: settings } = await supabase
      .from("ppa_integration_settings")
      .select("*")
      .limit(1)
      .single();

    // Get PPA API key from secrets
    const ppaApiKey = Deno.env.get("PPA_API_KEY");

    const logEvent = async (
      eventType: string,
      programCode: string | null,
      claimCaseId: string | null,
      requestSummary: string | null,
      responseStatus: number | null,
      responseSummary: string | null,
      errorMessage: string | null
    ) => {
      await supabase.from("integration_audit_log").insert({
        event_type: eventType,
        event_source: "ppa",
        program_code: programCode,
        claim_case_id: claimCaseId,
        request_summary: requestSummary,
        response_status: responseStatus,
        response_summary: responseSummary,
        error_message: errorMessage,
        user_id: userId,
      });
    };

    if (action === "test_connection") {
      if (!settings || !ppaApiKey || !settings.ppa_user_id) {
        return new Response(
          JSON.stringify({
            error: "PPA integration not configured. Please set your PPA User ID and API key.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const env = settings.environment as "sandbox" | "production";
      const urls = PPA_URLS[env];

      try {
        const token = await getAuthToken(urls.sso, ppaApiKey, settings.ppa_user_id);

        // Get service providers
        const spResult = await ppaApiCall(urls.api, token, "Account/ServiceProviders");

        let registeredPrograms = null;
        if (spResult.ok && settings.ppa_service_provider_id) {
          const rpResult = await ppaApiCall(
            urls.api,
            token,
            `Provider/${settings.ppa_service_provider_id}/RegisteredPrograms`
          );
          if (rpResult.ok) registeredPrograms = rpResult.data;
        }

        // Update settings with connection status
        await supabase
          .from("ppa_integration_settings")
          .update({
            is_connected: true,
            last_connection_test_at: new Date().toISOString(),
            last_connection_status: "Connected successfully",
            registered_programs: registeredPrograms || [],
          })
          .eq("id", settings.id);

        await logEvent("connection_test", null, null, `Environment: ${env}`, 200, "Success", null);

        return new Response(
          JSON.stringify({
            success: true,
            service_providers: spResult.data,
            registered_programs: registeredPrograms,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await supabase
          .from("ppa_integration_settings")
          .update({
            is_connected: false,
            last_connection_test_at: new Date().toISOString(),
            last_connection_status: `Failed: ${msg}`,
          })
          .eq("id", settings.id);

        await logEvent("connection_test_failed", null, null, `Environment: ${env}`, null, null, msg);

        return new Response(JSON.stringify({ error: msg }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "submit_claim") {
      const { claim_case_id, program_registration_id } = body;

      if (!settings || !ppaApiKey || !settings.ppa_user_id || !settings.ppa_service_provider_id) {
        return new Response(
          JSON.stringify({ error: "PPA integration not fully configured." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Load the claim case
      const { data: claimCase, error: caseError } = await supabase
        .from("claim_cases")
        .select("*")
        .eq("id", claim_case_id)
        .single();

      if (caseError || !claimCase) {
        return new Response(JSON.stringify({ error: "Claim case not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (claimCase.status !== "READY_FOR_CLAIM") {
        return new Response(
          JSON.stringify({ error: `Claim case status is ${claimCase.status}, must be READY_FOR_CLAIM` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Load program
      const { data: program } = await supabase
        .from("claim_programs")
        .select("*")
        .eq("id", claimCase.claim_program_id)
        .single();

      if (!program || !program.is_api_supported) {
        return new Response(
          JSON.stringify({ error: "Program does not support PPA API submission" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const env = settings.environment as "sandbox" | "production";
      const urls = PPA_URLS[env];

      try {
        const token = await getAuthToken(urls.sso, ppaApiKey, settings.ppa_user_id);

        // Build PPA claim payload per the program type
        const ppaPayload = buildPPAClaimPayload(program.ppa_program_code, claimCase, settings);
        const endpoint = getPPAClaimEndpoint(program.ppa_program_code, program_registration_id);

        const result = await ppaApiCall(urls.api, token, endpoint, "POST", ppaPayload);

        await logEvent(
          result.ok ? "claim_submitted" : "claim_submission_failed",
          program.code,
          claim_case_id,
          `POST ${endpoint}`,
          result.status,
          JSON.stringify(result.data).slice(0, 500),
          result.ok ? null : JSON.stringify(result.data).slice(0, 500)
        );

        if (result.ok) {
          const ppaClaimId = result.data?.ClaimId || result.data?.Id || result.data?.id || null;
          await supabase
            .from("claim_cases")
            .update({
              status: "CLAIMED",
              claimed_at: new Date().toISOString(),
              ppa_claim_id: ppaClaimId ? String(ppaClaimId) : null,
              ppa_response: result.data,
              ppa_submitted_at: new Date().toISOString(),
              submission_confirmed_by: userId,
            })
            .eq("id", claim_case_id);

          return new Response(
            JSON.stringify({ success: true, ppa_claim_id: ppaClaimId, ppa_response: result.data }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          await supabase
            .from("claim_cases")
            .update({
              ppa_response: result.data,
            })
            .eq("id", claim_case_id);

          return new Response(
            JSON.stringify({ error: "PPA API rejected the claim", details: result.data }),
            { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await logEvent("claim_submission_error", program.code, claim_case_id, null, null, null, msg);
        return new Response(JSON.stringify({ error: msg }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "get_audit_log") {
      const { data: logs } = await supabase
        .from("integration_audit_log")
        .select("*")
        .eq("event_source", "ppa")
        .order("created_at", { ascending: false })
        .limit(100);

      return new Response(JSON.stringify({ logs: logs || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Build claim payload based on PPA program code (follows PPA API spec field naming)
function buildPPAClaimPayload(ppaProgramCode: string | null, claimCase: any, settings: any) {
  const base = {
    ServiceProviderId: settings.ppa_service_provider_id,
    ServiceDate: claimCase.consult_date,
    PatientFirstName: claimCase.patient_initials?.charAt(0) || "X",
    PatientSurname: claimCase.patient_initials?.slice(1) || "X",
    PatientDateOfBirth: null, // Would come from patient record
    PatientGender: claimCase.patient_sex === "F" ? "Female" : claimCase.patient_sex === "M" ? "Male" : "Other",
    ConsentObtained: true,
  };

  switch (ppaProgramCode) {
    case "MedsCheck":
      return { ...base, MedsCheckType: "Standard" };
    case "DiabetesMedsCheck":
      return { ...base, DiabetesType: "Type2" };
    case "HMR":
      return { ...base, ReferralDate: claimCase.consult_date, GPName: "Referring GP" };
    case "RMMR":
      return { ...base, FacilityName: "Residential Facility", ReferralDate: claimCase.consult_date };
    case "ODT":
      return { ...base, SupplyType: "DailySupply" };
    case "CVCP":
      return { ...base, VaccineType: "COVID-19", DoseNumber: 1 };
    case "NIPVIP":
      return { ...base, VaccineType: "Influenza", DoseNumber: 1 };
    default:
      return base;
  }
}

function getPPAClaimEndpoint(ppaProgramCode: string | null, progRegId: string): string {
  const endpoints: Record<string, string> = {
    MedsCheck: `Program/${progRegId}/MedsCheckServiceClaim`,
    DiabetesMedsCheck: `Program/${progRegId}/DiabetesMedsCheckServiceClaim`,
    HMR: `Program/${progRegId}/HMRServiceClaim`,
    RMMR: `Program/${progRegId}/RMMRServiceClaim`,
    ODT: `Program/${progRegId}/ODTServiceClaim`,
    CVCP: `Program/${progRegId}/CVCPServiceClaim`,
    NIPVIP: `Program/${progRegId}/NIPVIPServiceClaim`,
  };
  return endpoints[ppaProgramCode || ""] || `Program/${progRegId}/ServiceClaim`;
}
