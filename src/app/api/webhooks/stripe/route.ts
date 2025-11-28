import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { unlockStore } from '@/lib/payments/memoryStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('[STRIPE_WEBHOOK_VERIFY_FAIL]', err?.message ?? err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const sessionObj = event.data.object as Stripe.Checkout.Session;

      // Retrieve full session to reliably access line_items + price
      let session: Stripe.Checkout.Session | null = null;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionObj.id, {
          expand: ['line_items.data.price'],
        });
      } catch (e) {
        console.error('[WEBHOOK] Failed to retrieve session', sessionObj.id, e);
      }

      const price = session?.line_items?.data?.[0]?.price as Stripe.Price | null | undefined;
      const priceId = price?.id;

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
      if (!plan) {
        console.error('[WEBHOOK] Unknown price id', priceId);
        return NextResponse.json({ error: 'Unknown price id' }, { status: 400 });
      }

      // Determine type + expiration
      let type: 'bundle' | 'pro' = plan === 'hour' ? 'pro' : 'bundle';
      let expSeconds: number;
      const credits = plan === 'starter' ? 1 : plan === 'standard' ? 2 : plan === 'career' ? 5 : null;

      if (plan === 'hour') {
        expSeconds = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
      } else {
        expSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days to use credits/templates
      }

      // Save to shared in-memory store for quick confirm lookup
      unlockStore.save({
        sessionId: sessionObj.id,
        type,
        expMs: expSeconds * 1000,
        credits,
        email: session?.customer_details?.email ?? null,
        amountTotal: session?.amount_total ?? null,
        createdAtMs: Date.now(),
      });

      console.log('[WEBHOOK] Cached payment', sessionObj.id, type, new Date(expSeconds * 1000).toISOString());
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[STRIPE_WEBHOOK_ERROR]', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
