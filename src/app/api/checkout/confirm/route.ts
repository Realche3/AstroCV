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
      const normalizedType: 'bundle' | 'pro' = rec.type === 'pro' ? 'pro' : 'bundle';
      const token = issueAccessToken({ type: normalizedType, exp: expSeconds, sid: rec.sessionId, email: rec.email ?? undefined });
      const response = NextResponse.json({ token, type: normalizedType, exp: expSeconds, credits: rec.credits ?? null }, { headers: { 'Cache-Control': 'no-store' } });
      response.cookies.delete('tailor_quota');
      return response;
    }

    // 2) Fallback: retrieve session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price'] });
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const price = session.line_items?.data?.[0]?.price as Stripe.Price | null | undefined;
    const priceId = price?.id;
    if (!priceId) return NextResponse.json({ error: 'Missing price' }, { status: 400 });

    const priceMap = {
      starter: process.env.STRIPE_PRICE_STARTER,
      standard: process.env.STRIPE_PRICE_STANDARD,
      career: process.env.STRIPE_PRICE_CAREER,
      hour: process.env.STRIPE_PRICE_HOUR,
    };

    let plan: 'starter' | 'standard' | 'career' | 'hour' | null = null;
    for (const key of Object.keys(priceMap) as (keyof typeof priceMap)[]) {
      if (priceId === priceMap[key]) {
        plan = key;
        break;
      }
    }
    if (!plan) return NextResponse.json({ error: 'Unknown price' }, { status: 400 });

    const type: 'bundle' | 'pro' = plan === 'hour' ? 'pro' : 'bundle';
    const credits = plan === 'starter' ? 1 : plan === 'standard' ? 2 : plan === 'career' ? 5 : null;
    const expSeconds =
      type === 'pro'
        ? Math.floor(Date.now() / 1000) + 60 * 60
        : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days to use credits/templates

    const token = issueAccessToken({ type, exp: expSeconds, sid: sessionId, email: session.customer_details?.email ?? undefined });
    const response = NextResponse.json({ token, type, exp: expSeconds, credits }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.delete('tailor_quota');
    return response;
  } catch (err) {
    console.error('[CHECKOUT_CONFIRM_ERROR]', err);
    return NextResponse.json({ error: 'Failed to confirm checkout' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
export const dynamic = 'force-dynamic';
