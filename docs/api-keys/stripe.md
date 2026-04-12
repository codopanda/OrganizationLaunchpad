# Stripe

Purpose: Payment processing, subscriptions, billing management, and invoicing.

Console URL: https://dashboard.stripe.com

---

## Creating a Stripe Account and Getting API Keys

1. Go to https://dashboard.stripe.com and sign up for an account.
2. After verification, access your **Dashboard**.
3. Navigate to **Developers** > **API keys**.
4. You will see two key pairs:
   - **Test mode** keys (prefixed with `sk_test_` and `pk_test_`) - for development.
   - **Live mode** keys (prefixed with `sk_live_` and `pk_live_`) - for production.

Copy the **Secret key** (`sk_test_...` or `sk_live_...`) and store it securely. The public key (`pk_test_...`) can be safely exposed in frontend code.

---

## Stripe Customer Portal Setup

The Customer Portal allows users to manage their subscriptions (cancel, upgrade, update payment methods).

1. In Stripe Dashboard, go to **Customers** > **Customer Portal**.
2. Configure your portal settings:
   - Enable/disable features (cancel subscription, update payment method, download invoices).
   - Set branding (logo, colors).
   - Configure which products are visible.
3. Click **Save**.
4. Copy the **Portal URL** generated - this is your `STRIPE_CUSTOMER_PORTAL_URL`.

For programmatic portal session creation, use:

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: 'cus_xxx',
  return_url: 'https://yourapp.com/settings',
});
```

---

## Webhook Configuration

Webhooks are required to handle asynchronous events like subscription updates, payment successes, and failures.

### Option 1: Supabase Edge Functions

1. Create an Edge Function:
   ```bash
   supabase functions new stripe-webhook
   ```

2. Set the webhook secret as a secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

3. Deploy with webhook endpoint exposed.

### Option 2: Cloudflare Workers

1. Add to your Worker:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

2. Enter your webhook signing secret when prompted.

---

## Example Webhook Handler

```typescript
// Using Stripe Node.js SDK
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function handleWebhook(req: Request): Promise<Response> {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSuccess(invoice);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;

  // Update user subscription status in your database
  // await supabase.from('users').update({ subscription_status: status, price_id: priceId }).eq('stripe_customer_id', customerId);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  // await supabase.from('users').update({ subscription_status: 'cancelled' }).eq('stripe_customer_id', customerId);
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  // Grant access, send receipt email, etc.
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Notify user, pause access, etc.
}
```

### Registering the Webhook Endpoint

In Stripe Dashboard:
1. Go to **Developers** > **Webhooks**.
2. Click **Add endpoint**.
3. Enter your webhook URL (e.g., `https://api.yourapp.com/webhook` or your Supabase Edge Function URL).
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Click **Add endpoint**.

---

## STRIPE_WEBHOOK_SECRET Setup

The webhook secret (`whsec_xxx`) is used to verify that requests actually come from Stripe.

1. After registering your webhook endpoint, Stripe will display the **Signing secret** (or webhook secret).
2. Set it as an environment variable:
   ```bash
   # Supabase Edge Functions
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

   # Cloudflare Workers
   wrangler secret put STRIPE_WEBHOOK_SECRET
   ```
3. Never commit this value to version control.

---

## Test Mode vs Live Mode

| Aspect | Test Mode | Live Mode |
|--------|-----------|-----------|
| API Keys | `sk_test_...`, `pk_test_...` | `sk_live_...`, `pk_live_...` |
| Data | Isolated sandbox | Real money |
| Card Numbers | Use Stripe test cards | Use real cards |
| Webhooks | Same endpoint, different mode | Same endpoint, different mode |
| Dashboard | Toggle via environment switcher | Toggle via environment switcher |

### Stripe Test Card Numbers

| Card Number | Scenario |
|-------------|----------|
| `4242424242424242` | Successful payment |
| `4000000000000002` | Declined card |
| `4000002500003155` | Requires authentication |
| `4000000000009995` | Insufficient funds |

Use any future expiry date, any 3-digit CVC, and any postal code.

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `STRIPE_SECRET_KEY` | Worker/Edge Function (server-side only) | API authentication for Stripe operations |
| `STRIPE_WEBHOOK_SECRET` | Worker/Edge Function | Verifies webhook authenticity |
| `STRIPE_CUSTOMER_PORTAL_URL` | Frontend/Worker | URL to Stripe-hosted customer portal |
| `VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Frontend only | Safe for browser - used with Stripe.js |

**Critical**: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` must never be exposed to frontend code.

---

## Tips for Testing with Stripe CLI

Stripe CLI lets you forward webhooks to your local environment for testing.

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli

2. Login:
   ```bash
   stripe login
   ```

3. Forward events to your local endpoint:
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```

4. The CLI will output a webhook signing secret (starts with `whsec_`). Use this locally or set it as `STRIPE_WEBHOOK_SECRET` in your Edge Function secrets.

5. Trigger test events:
   ```bash
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_succeeded
   stripe trigger customer.subscription.deleted
   ```

6. View recent webhook deliveries:
   ```bash
   stripe logs tail
   ```

---

## Security Best Practices

1. **Never expose secret keys**
   - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-side only.
   - Use `VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY` for frontend Stripe.js.

2. **Always verify webhook signatures**
   ```typescript
   const event = stripe.webhooks.constructEvent(body, signature, secret);
   ```
   Skip this and you open yourself to spoofed events.

3. **Use least-privilege API keys**
   Create restricted API keys in Stripe Dashboard > Developers > API keys > Restricted keys. Grant only permissions needed (e.g., read-only for analytics, specific write permissions for your use case).

4. **Store customer IDs, not card details**
   Never store raw card numbers. Stripe handles PCI compliance when you use their tokenized system (`payment_method` IDs).

5. **Idempotency**
   Use idempotency keys when creating charges or subscriptions to prevent duplicate operations:
   ```typescript
   stripe.subscriptions.create(
     { customer: 'cus_xxx', items: [{ price: 'price_xxx' }] },
     { idempotencyKey: 'unique-subscription-key' }
   );
   ```

6. **Handle failures gracefully**
   Implement retry logic for failed payments and webhook handling failures. Stripe may retry webhook delivery up to 72 hours.

7. **Use Stripe Radar for fraud prevention**
   Enable Stripe Radar for advanced fraud detection, especially in live mode.

8. **Regular key rotation**
   Rotate API keys periodically. Generate new keys in Dashboard, update your secrets, then revoke old keys.

9. **Monitor webhook logs**
   Regularly check Stripe Dashboard > Developers > Webhooks > [your endpoint] > Logs for failures or unusual activity.

10. **Environment separation**
    Maintain strict separation between test and live mode. Use different Supabase projects or database schemas for test vs production data.

---

## Ownership

Rotate keys if compromised. Access through the Stripe Dashboard with owner/admin credentials. Document any additional team members who have access in your team's secrets manager.

## Rotation Notes

Stripe keys do not expire but should be rotated if compromised. Create a new key, update your environment variables, deploy, verify functionality, then delete the old key.
