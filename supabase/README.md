# Supabase

## Migrations

| File | What it creates |
|---|---|
| `0001_initial_schema.sql` | `profiles` and `feedback` tables with RLS |
| `0002_profiles_trigger.sql` | Auto-creates a profile row on user signup |
| `0004_storage_buckets.sql` | Storage buckets with policies |
| `0005_stripe_subscriptions.sql` | `subscriptions` table; auto-creates a free row on signup |

Push all migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Edge Functions

| Function | What it does | Required secrets |
|---|---|---|
| `health` | Health check endpoint | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| `stripe-checkout` | Creates a Stripe checkout session | `STRIPE_SECRET_KEY`, `SITE_URL` |
| `stripe-webhook` | Handles Stripe payment events, updates DB, sends email | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM` |
| `send-email` | Sends transactional email via Resend | `RESEND_API_KEY`, `EMAIL_FROM` |

Deploy all functions:

```bash
supabase functions deploy
```

Set secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EMAIL_FROM=noreply@mail.yourapp.com
supabase secrets set SITE_URL=https://yourapp.com
```

## Stripe Webhook Setup

Point the Stripe webhook at your edge function URL:

```
https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
```

Events to subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
