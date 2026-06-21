// Contact form handler (SSR). Receives the homepage inquiry form and emails it.
// Cloudflare: set RESEND_API_KEY as a Worker secret. Locally: put it in .dev.vars.
// Sending uses Resend (https://resend.com). The "from" domain (zetax.jp) must be
// verified in Resend. If the key is missing, the endpoint returns ok:false so the
// UI can show a fallback ("please email info@zetax.jp directly") instead of
// silently dropping the inquiry.
import type { APIRoute } from "astro";

export const prerender = false;

const TO = "contact@zetax.co.jp";
const FROM = "noreply@zetax.jp";

export const POST: APIRoute = async ({ request, locals }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "invalid_request" }, 400);
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const interest = String(form.get("interest") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!name || !email) {
    return json({ ok: false, error: "missing_fields" }, 400);
  }

  // Cloudflare exposes runtime secrets via locals.runtime.env; dev uses import.meta.env / .dev.vars
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })
    ?.runtime?.env;
  const apiKey = runtimeEnv?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;

  if (!apiKey) {
    // Not configured yet — tell the client to fall back to a direct email.
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const text = [
    `お名前: ${name}`,
    `会社名: ${company || "-"}`,
    `メール: ${email}`,
    `ご興味: ${interest || "-"}`,
    "",
    "お問い合わせ内容:",
    message || "-",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ZetaX <${FROM}>`,
        to: [TO],
        reply_to: email,
        subject: `お問い合わせ: ${name}${company ? `（${company}）` : ""}`,
        text,
      }),
    });
    if (!res.ok) {
      return json({ ok: false, error: "send_failed" }, 502);
    }
  } catch {
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
