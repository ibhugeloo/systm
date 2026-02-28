import { NextRequest, NextResponse } from 'next/server';

// Stripe webhook handler placeholder
// Will be implemented when Stripe integration is activated
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // TODO: Verify webhook signature with Stripe
    // TODO: Handle subscription events (created, updated, canceled)
    // TODO: Handle payment events (succeeded, failed)

    console.log('Stripe webhook received:', body.substring(0, 100));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
