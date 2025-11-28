import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type PlanId = 'starter' | 'standard' | 'career' | 'hour';

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    const allowedPlans: PlanId[] = ['starter', 'standard', 'career', 'hour'];
    if (!allowedPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planKey = plan as PlanId;
    const priceEnvMap: Record<PlanId, string | undefined> = {
      starter: process.env.STRIPE_PRICE_STARTER,
      standard: process.env.STRIPE_PRICE_STANDARD,
      career: process.env.STRIPE_PRICE_CAREER,
      hour: process.env.STRIPE_PRICE_HOUR,
    };

    const priceId = priceEnvMap[planKey];

    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    // Prefer explicit env for prod custom domain; fall back to request origin
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.BASE_URL ||
      new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan },
      success_url: `${baseUrl}/unlock/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
      // allow_promotion_codes: true,
    });

    return NextResponse.json({ checkoutUrl: session.url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[CHECKOUT_CREATE_ERROR]', err);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
export const dynamic = 'force-dynamic';
