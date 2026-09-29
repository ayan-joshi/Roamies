import "server-only";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { after } from "next/server";

/*
 * Email alerts via Resend. Runs after the response is sent (next/server `after`), so a slow or
 * failing email never blocks the user. If any env var is missing, alerts are skipped.
 *
 * Needs (server-only, never NEXT_PUBLIC_):
 *   SUPABASE_SERVICE_ROLE_KEY  to look up the recipient's email + alert preference
 *   RESEND_API_KEY             from resend.com
 *   EMAIL_FROM                 e.g. "Roamies <hello@your-domain.in>" (a domain verified in Resend)
 *   NEXT_PUBLIC_SITE_URL       e.g. "https://roamies.vercel.app" for links in the email
 */

type Recipient = { email: string; name: string | null };

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url || !serviceKey || !resendKey || !from || !site) return null;
  return { url, serviceKey, resendKey, from, site: site.replace(/\/$/, "") };
}

// Email + opt-in, read with the service role (emails are not readable through RLS).
async function recipient(userId: string, cfg: NonNullable<ReturnType<typeof config>>): Promise<Recipient | null> {
  const admin = createAdminClient(cfg.url, cfg.serviceKey, { auth: { persistSession: false } });
  const [{ data: user }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("profiles").select("display_name, email_alerts").eq("id", userId).maybeSingle(),
  ]);
  const email = user?.user?.email;
  if (!email || profile?.email_alerts === false) return null;
  return { email, name: profile?.display_name ?? null };
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(heading: string, body: string, cta: { label: string; href: string }, site: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3eee5;font-family:Arial,sans-serif;color:#1d1a16">
<div style="max-width:480px;margin:0 auto;padding:28px 20px">
  <p style="font-weight:800;font-size:20px;margin:0 0 20px">roamies</p>
  <div style="background:#fffdf7;border-radius:18px;padding:22px">
    <h1 style="font-size:22px;line-height:1.25;margin:0 0 12px">${heading}</h1>
    ${body}
    <a href="${cta.href}" style="display:inline-block;margin-top:18px;background:#1d1a16;color:#fffdf7;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px">${cta.label}</a>
  </div>
  <p style="font-size:12px;color:#5a5044;margin-top:18px">You can turn these emails off in <a href="${site}/account" style="color:#5a5044">Account</a>.</p>
</div></body></html>`;
}

async function send(to: string, subject: string, html: string, text: string, cfg: NonNullable<ReturnType<typeof config>>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: cfg.from, to, subject, html, text }),
  });
  if (!res.ok) console.error("[notify] resend failed", res.status, await res.text());
}

function schedule(task: (cfg: NonNullable<ReturnType<typeof config>>) => Promise<void>) {
  const cfg = config();
  if (!cfg) return; // not configured yet: skip silently
  after(async () => {
    try {
      await task(cfg);
    } catch (e) {
      console.error("[notify] failed", e);
    }
  });
}

export function notifyNewIntro(p: { receiverId: string; senderName: string; about: string; message: string }) {
  schedule(async (cfg) => {
    const to = await recipient(p.receiverId, cfg);
    if (!to) return;
    const subject = `${p.senderName} pinned a note on your ${p.about}`;
    const html = layout(
      escape(subject),
      `<p style="margin:0;color:#5a5044">They wrote:</p><p style="font-size:17px;line-height:1.45;margin:8px 0 0">“${escape(p.message)}”</p>`,
      { label: "Reply or pass", href: `${cfg.site}/intros` },
      cfg.site,
    );
    await send(to.email, subject, html, `${subject}\n\n"${p.message}"\n\nReply or pass: ${cfg.site}/intros`, cfg);
  });
}

export function notifyMatch(p: { senderId: string; accepterName: string; matchId: number }) {
  schedule(async (cfg) => {
    const to = await recipient(p.senderId, cfg);
    if (!to) return;
    const subject = `It's a trip: ${p.accepterName} accepted your intro`;
    const html = layout(
      escape(subject),
      `<p style="font-size:16px;line-height:1.45;margin:0">Say hi and start planning: dates, budget, who books the bus.</p>`,
      { label: "Open the planning room", href: `${cfg.site}/matches/${p.matchId}` },
      cfg.site,
    );
    await send(to.email, subject, html, `${subject}\n\nOpen the planning room: ${cfg.site}/matches/${p.matchId}`, cfg);
  });
}

// Message text is never put in the email, only a nudge to open the app.
export function notifyMessage(p: { recipientId: string; senderName: string; matchId: number }) {
  schedule(async (cfg) => {
    const to = await recipient(p.recipientId, cfg);
    if (!to) return;
    const subject = `New message from ${p.senderName}`;
    const html = layout(
      escape(subject),
      `<p style="font-size:16px;line-height:1.45;margin:0">${escape(p.senderName)} sent you a message on Roamies.</p>`,
      { label: "Read it", href: `${cfg.site}/matches/${p.matchId}` },
      cfg.site,
    );
    await send(to.email, subject, html, `${subject}\n\nRead it: ${cfg.site}/matches/${p.matchId}`, cfg);
  });
}
