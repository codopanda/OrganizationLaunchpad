// Supabase Edge Function — Create Stripe Checkout Session
// Deploy with: supabase functions deploy stripe-checkout
// Secrets needed: STRIPE_SECRET_KEY, SITE_URL

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId) {
      return new Response(JSON.stringify({ error: 'priceId and userId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create or retrieve Stripe customer
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: userEmail ?? '',
        metadata: { supabase_user_id: userId },
      }),
    });
    const customer = await customerRes.json();

    // Create checkout session
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customer.id,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        mode: 'subscription',
        success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pricing`,
        'metadata[supabase_user_id]': userId,
      }),
    });

    const session = await sessionRes.json();

    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
