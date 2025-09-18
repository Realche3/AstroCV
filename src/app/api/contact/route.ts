import { NextResponse } from 'next/server';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'admin@astrolyft.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = (body?.name || '').toString().trim();
    const email = (body?.email || '').toString().trim();
    const subjectRaw = (body?.subject || '').toString().trim();
    const message = (body?.message || '').toString().trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      console.error('[CONTACT_ERROR] RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    const subject = subjectRaw || `New contact form message from ${name}`;
    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111827;">
        <h2 style="margin:0 0 12px 0;">New Message from astroCV Contact Form</h2>
        <p style="margin:0 0 4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 4px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:12px 0 8px 0;"><strong>Message:</strong></p>
        <div style="white-space:pre-wrap; line-height:1.5;">${escapeHtml(message)}</div>
      </div>
    `;
    const text = `New Message from astroCV Contact Form\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [CONTACT_EMAIL],
        subject,
        html,
        text,
        reply_to: email,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('[CONTACT_SEND_ERROR]', res.status, data);
      return NextResponse.json({ error: 'Failed to send your message. Please try again later.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[CONTACT_API_ERROR]', err);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
export const dynamic = 'force-dynamic';
