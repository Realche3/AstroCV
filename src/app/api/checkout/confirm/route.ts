import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// simple HMAC-signed token (JWT-like)
function signToken(payload: object) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', process.env.ACCESS_TOKEN_SECRET!).update(unsigned).digest('base64url');
  return `${unsigned}.${sig}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price'] });
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const priceId = (session.line_items?.data?.[0]?.price as any)?.id as string | undefined;
    if (!priceId) return NextResponse.json({ error: 'Missing price' }, { status: 400 });

    let type: 'single' | 'pro' = 'single';
    let expSeconds: number;

    if (priceId === process.env.STRIPE_PRICE_HOUR) {
      type = 'pro';
      expSeconds = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    } else {
      // $1.99 — give short window (10 minutes)
      type = 'single';
      expSeconds = Math.floor(Date.now() / 1000) + 10 * 60;
    }

    const token = signToken({ type, exp: expSeconds });
    return NextResponse.json({ token, type, exp: expSeconds });
  } catch (err) {
    console.error('[CHECKOUT_CONFIRM_ERROR]', err);
    return NextResponse.json({ error: 'Failed to confirm checkout' }, { status: 500 });
  }
}
