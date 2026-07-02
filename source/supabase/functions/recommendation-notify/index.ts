import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const clean = (value: unknown) => String(value || "").trim();
const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RECOMMENDATION_NOTIFY_FROM") || "Portfolio Notifications <onboarding@resend.dev>";
  const fallbackTo = Deno.env.get("RECOMMENDATION_NOTIFY_TO") || "soorajsudhakaran1199@gmail.com";

  if (!resendApiKey) {
    return Response.json({ error: "RESEND_API_KEY is not configured." }, { status: 500, headers: corsHeaders });
  }

  const body = await request.json().catch(() => ({}));
  const recommendation = body?.recommendation || {};
  const to = clean(body?.to) || fallbackTo;
  const name = clean(recommendation.name);
  const role = clean(recommendation.role);
  const company = clean(recommendation.company);
  const linkedin = clean(recommendation.linkedin);
  const quote = clean(recommendation.quote);

  if (!name || !role || !company || !quote) {
    return Response.json({ error: "Recommendation details are incomplete." }, { status: 400, headers: corsHeaders });
  }

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0f172a">
      <h2 style="margin:0 0 12px">New portfolio recommendation submitted</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company)}</p>
      ${linkedin ? `<p><strong>LinkedIn / Website:</strong> <a href="${escapeHtml(linkedin)}">${escapeHtml(linkedin)}</a></p>` : ""}
      <div style="margin-top:16px;padding:14px 16px;border-left:4px solid #1c7dff;background:#f8fbff">
        ${escapeHtml(quote).replace(/\n/g, "<br />")}
      </div>
      <p style="margin-top:18px;color:#475569">Open the portfolio Admin Review panel to approve, reject, or delete this recommendation.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject: `New portfolio recommendation from ${name.slice(0, 80)}`,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    return Response.json({ error: details || "Email provider request failed." }, { status: 502, headers: corsHeaders });
  }

  return Response.json({ ok: true }, { headers: corsHeaders });
});
