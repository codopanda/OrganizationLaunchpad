// Supabase Edge Function — Stripe Webhook Handler
// Deploy with: supabase functions deploy stripe-webhook
// Secrets needed: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const expectedSig = parts['v1'];

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === expectedSig;
}

async function updateSubscription(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  data: {
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_price_id: string;
    plan: 'free' | 'pro';
    status: 'active' | 'inactive' | 'canceled' | 'past_due';
    current_period_end: string | null;
  },
) {
  const res = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase update failed: ${text}`);
  }
}

async function sendWelcomeEmail(resendKey: string, userEmail: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') ?? 'noreply@example.com',
      to: userEmail,
      subject: "You're now a Pro member!",
      html: `
        <h1>Welcome to Pro!</h1>
        <p>Your subscription is now active. You have access to all Pro features.</p>
        <p>Thank you for your support.</p>
      `,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing required secrets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  const valid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const event = JSON.parse(body);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      if (!userId) throw new Error('No supabase_user_id in session metadata');

      // Fetch subscription details from Stripe
      const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const sub = await subRes.json();

      await updateSubscription(supabaseUrl, serviceRoleKey, userId, {
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        stripe_price_id: sub.items?.data[0]?.price?.id ?? '',
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });

      if (resendKey && session.customer_details?.email) {
        await sendWelcomeEmail(resendKey, session.customer_details.email);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const userId = sub.metadata?.supabase_user_id;

      // Look up user by customer id if metadata missing
      if (!userId) {
        console.warn('No supabase_user_id in subscription metadata, skipping');
      } else {
        const statusMap: Record<string, 'active' | 'inactive' | 'canceled' | 'past_due'> = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'canceled',
          unpaid: 'inactive',
          incomplete: 'inactive',
        };

        await updateSubscription(supabaseUrl, serviceRoleKey, userId, {
          stripe_customer_id: sub.customer,
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items?.data[0]?.price?.id ?? '',
          plan: sub.status === 'active' ? 'pro' : 'free',
          status: statusMap[sub.status] ?? 'inactive',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        await updateSubscription(supabaseUrl, serviceRoleKey, userId, {
          stripe_customer_id: sub.customer,
          stripe_subscription_id: sub.id,
          stripe_price_id: '',
          plan: 'free',
          status: 'canceled',
          current_period_end: null,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
