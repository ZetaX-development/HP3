// Contact form handler (SSR). Receives the homepage inquiry form and emails it.
// Cloudflare: set RESEND_API_KEY as a Worker secret. Locally: put it in .dev.vars.
// Sending uses Resend (https://resend.com). The "from" domain (zetax.jp) must be
// verified in Resend. If the key is missing, the endpoint returns ok:false so the
// UI can show a fallback ("please email info@zetax.jp directly") instead of
// silently dropping the inquiry.
import type { APIRoute } from "astro";

export const prerender = false;

const TO = ["ysato@zetax.jp", "kyanagisawa@zetax.jp"];
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
  const department = String(form.get("department") ?? "").trim();
  const interest = String(form.get("interest") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  // "training" = AI研修の資料請求フォーム（/ai-training）。それ以外は通常の問い合わせ。
  const formType = String(form.get("formType") ?? "").trim();
  const isTrainingRequest = formType === "training";

  if (!name || !email || (isTrainingRequest && !company)) {
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

  const text = isTrainingRequest
    ? [
        "AI研修の資料請求が届きました。",
        "",
        `会社名: ${company}`,
        `お名前: ${name}`,
        `部署: ${department || "-"}`,
        `社用メール: ${email}`,
        "",
        "コメント:",
        message || "-",
      ].join("\n")
    : [
        `お名前: ${name}`,
        `会社名: ${company || "-"}`,
        `メール: ${email}`,
        `ご興味: ${interest || "-"}`,
        "",
        "お問い合わせ内容:",
        message || "-",
      ].join("\n");

  const subject = isTrainingRequest
    ? `【AI研修 資料請求】${name}（${company}）`
    : `お問い合わせ: ${name}${company ? `（${company}）` : ""}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ZetaX <${FROM}>`,
        to: TO,
        reply_to: email,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      return json({ ok: false, error: "send_failed" }, 502);
    }
  } catch {
    return json({ ok: false, error: "send_failed" }, 502);
  }

  // 資料請求には受付確認の自動返信を送る。失敗しても受付自体は成功扱い
  // （通知メールは届いているので、取りこぼしにはならない）。
  if (isTrainingRequest) {
    const autoReplyText = [
      `${name} 様`,
      "",
      "この度は、ZetaXのAI研修資料をご請求いただきありがとうございます。",
      "以下の内容で資料請求を受け付けました。",
      "",
      `会社名: ${company}`,
      `お名前: ${name}`,
      department ? `部署: ${department}` : null,
      "",
      "2営業日以内に、担当者より研修資料をお送りいたします。",
      "ご不明な点がございましたら、本メールへの返信またはysato@zetax.jpまでお気軽にご連絡ください。",
      "",
      "※本メールに心当たりがない場合は、お手数ですが破棄してください。",
      "",
      "―――――――――――――――――――",
      "株式会社ZetaX",
      "東京都渋谷区神南1丁目11−4 FPGリンクス神南 5階",
      "https://zetax.jp",
      "―――――――――――――――――――",
    ]
      .filter((line) => line !== null)
      .join("\n");

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `ZetaX <${FROM}>`,
          to: [email],
          reply_to: "ysato@zetax.jp",
          subject: "【ZetaX】AI研修資料のご請求を受け付けました",
          text: autoReplyText,
        }),
      });
    } catch {
      // best-effort
    }
  }

  return json({ ok: true }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
