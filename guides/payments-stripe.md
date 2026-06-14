# Payments — Stripe

You are setting up Stripe so the user can accept payments. Follow every step in order. Open URLs directly if your environment supports it.

---

## 1. Create a Stripe Account

Open `https://dashboard.stripe.com/register`

The page shows sign-up fields. Tell the user:

> "I've opened Stripe's sign-up page. Enter your email, full name, country, and a password."

Wait for them to register or log in.

After logging in, Stripe shows the dashboard. There may be a prompt to activate the account — the user can skip this for now and activate later when they are ready to take real payments.

---

## 2. Get Your API Keys

In the left sidebar, click **Developers**.

Click **API keys**.

You will see two keys:

| What you see | Variable name | Notes |
|---|---|---|
| **Publishable key** (starts with `pk_test_`) | `STRIPE_PUBLISHABLE_KEY` | Safe to use in frontend code |
| **Secret key** (click **Reveal test key**) | `STRIPE_SECRET_KEY` | Server only — never expose to browser |

Click **Reveal test key** to see the secret key.

Copy both keys and paste them into your deploy platform's environment variables now (Vercel or Cloudflare).

Also add them to `.env.local`:

```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

> You are using **test** keys. No real money moves. Switch to live keys when you are ready to go live (Step 7).

---

## 3. Create a Product

In the left sidebar, click **Product catalog**.

Click **Add product**.

Fill in:

| Field | Value |
|---|---|
| **Name** | What you are selling (e.g. `Pro Plan`, `One-time Purchase`) |
| **Description** | Optional — shown to customers at checkout |
| **Image** | Optional |

Under **Pricing**, set:

| Field | Value |
|---|---|
| **Pricing model** | One-time or Recurring — ask the user which they want |
| **Price** | The amount |
| **Currency** | USD or the user's currency |

Click **Add product**.

After saving, open the product and copy the **Price ID** (starts with `price_`). You will use this when creating a checkout session.

---

## 4. Set Up a Webhook

Stripe needs to tell your app when a payment succeeds. This is done via a webhook.

In the left sidebar, click **Developers** → **Webhooks**.

Click **Add endpoint**.

| Field | Value |
|---|---|
| **Endpoint URL** | `https://your-app-url.com/api/stripe/webhook` |
| **Description** | Optional |
| **Events to listen to** | Click **Select events** → check `checkout.session.completed`, `payment_intent.succeeded`, `invoice.payment_succeeded` |

Replace `your-app-url.com` with the URL from your deploy platform.

Click **Add endpoint**.

On the next screen, click **Reveal** under **Signing secret**. Copy the value (starts with `whsec_`).

Paste it into your deploy platform as `STRIPE_WEBHOOK_SECRET` and into `.env.local`.

---

## 5. Add a Checkout Route

Find the user's API route directory:
- Next.js: `app/api/` or `pages/api/`
- Other frameworks with a server: look for a routes or api folder

Create `app/api/stripe/checkout/route.ts` (Next.js App Router) or the equivalent:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { priceId } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment', // or 'subscription' for recurring
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
  })

  return Response.json({ url: session.url })
}
```

Create `app/api/stripe/webhook/route.ts`:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    // TODO: fulfill the order — unlock a feature, send a receipt, etc.
    console.log('Payment succeeded for session:', session.id)
  }

  return new Response('OK')
}
```

Adjust the file paths and import style to match the user's framework.

---

## 6. Install the Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

---

## 7. Test a Payment

Run the app locally:

```bash
npm run dev
```

In a separate terminal, start the Stripe webhook listener (requires Stripe CLI):

```bash
# Install Stripe CLI first if needed: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Trigger a test checkout from your app. At the Stripe checkout page, use:

| Field | Test value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| Postcode | Any |

After submitting, check the terminal running `stripe listen` — you should see `checkout.session.completed`.

---

## 8. Go Live (When Ready)

When the user is ready to accept real payments:

1. Go to `https://dashboard.stripe.com/account/onboarding` and complete identity verification
2. Go to **Developers → API keys** → click **Live mode** toggle at the top
3. Copy the live publishable and secret keys
4. Replace the test keys in the deploy platform with live keys
5. Update the webhook endpoint to use the live signing secret
6. Remove `stripe listen` — Stripe will send webhooks directly to the production URL

Tell the user: "You are now in live mode. Real cards will be charged."
