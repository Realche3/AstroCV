import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { issueAccessToken } from '@/lib/payments/jwt';
import { unlockStore } from '@/lib/payments/memoryStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

    // 1) Try cache first (in-memory store written by webhook)
    const rec = unlockStore.getBySession(sessionId);
    if (rec) {
      const expSeconds = Math.floor(rec.expMs / 1000);
      const token = issueAccessToken({ type: rec.type, exp: expSeconds, sid: rec.sessionId, email: rec.email ?? undefined });
      return NextResponse.json({ token, type: rec.type, exp: expSeconds });
    }

    // 2) Fallback: retrieve session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price'] });
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const price = session.line_items?.data?.[0]?.price as Stripe.Price | null | undefined;
    const priceId = price?.id;
    if (!priceId) return NextResponse.json({ error: 'Missing price' }, { status: 400 });

    let type: 'single' | 'pro' = 'single';
    let expSeconds: number;

    if (priceId === process.env.STRIPE_PRICE_HOUR) {
      type = 'pro';
      expSeconds = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    } else {
      // single purchase: short window
      type = 'single';
      expSeconds = Math.floor(Date.now() / 1000) + 10 * 60;
    }

    const token = issueAccessToken({ type, exp: expSeconds, sid: sessionId, email: session.customer_details?.email ?? undefined });
    return NextResponse.json({ token, type, exp: expSeconds });
  } catch (err) {
    console.error('[CHECKOUT_CONFIRM_ERROR]', err);
    return NextResponse.json({ error: 'Failed to confirm checkout' }, { status: 500 });
  }
}
