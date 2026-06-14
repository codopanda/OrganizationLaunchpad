# Email — Resend

You are setting up Resend for transactional email (verification, welcome, receipts). This guide also wires Resend into Supabase so that Supabase's auth emails (email confirmation, password reset) are sent via your own domain instead of Supabase's shared domain.

Follow every step in order. Open URLs directly if your environment supports it.

---

## 1. Create a Resend Account

Open `https://resend.com`

Click **Sign Up** in the top right.

Tell the user:

> "I've opened Resend. Sign up with your email or GitHub."

Wait for them to sign up or log in. They land on the Resend dashboard.

---

## 2. Add and Verify a Sending Domain

Resend requires a domain you own to send email from. You cannot send from Gmail or another provider's address.

In the left sidebar, click **Domains**.

Click **Add Domain**.

| Field | Value |
|---|---|
| **Domain** | A subdomain you will send from, e.g. `mail.yourapp.com` or `updates.yourapp.com` |
| **Region** | US East (default is fine) |

Click **Add**.

Resend shows a list of DNS records to add. These look like:

| Type | Name | Value |
|---|---|---|
| MX | `mail.yourapp.com` | `feedback-smtp.us-east-1.amazonses.com` |
| TXT | `mail.yourapp.com` | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey.mail.yourapp.com` | `p=...` (a long string) |

**Add these records at your domain registrar:**

Ask the user where their domain DNS is managed (Cloudflare, Namecheap, GoDaddy, Google Domains, etc.) and open the right DNS settings page:

- Cloudflare DNS: `https://dash.cloudflare.com` → click the domain → **DNS** → **Records** → **Add record**
- Namecheap: `https://www.namecheap.com/myaccount/login/` → **Domain List** → **Manage** → **Advanced DNS**
- GoDaddy: `https://dcc.godaddy.com/manage/dns`

Add each record from Resend exactly as shown. MX records need a **Priority** of 10.

Back in Resend, click **Verify DNS Records**. 

> DNS can take a few minutes to propagate. If verification fails, wait 5 minutes and try again. It should not take more than 30 minutes.

Once the domain shows a green **Verified** badge, continue.

---

## 3. Get Your API Key

In the left sidebar, click **API Keys**.

Click **Create API Key**.

| Field | Value |
|---|---|
| **Name** | Your app name |
| **Permission** | Sending access |
| **Domain** | Select the domain you just verified |

Click **Add**.

Resend shows the API key once — copy it now. It starts with `re_`.

Paste it into your deploy platform as `RESEND_API_KEY` and into `.env.local`:

```
RESEND_API_KEY=re_...
```

---

## 4. Wire Resend Into Supabase Auth

Supabase sends emails for account verification and password resets. By default it uses a Supabase shared address with low deliverability. This step makes those emails come from your verified Resend domain instead.

Open your Supabase project at `https://supabase.com/dashboard`

In the left sidebar, click **Authentication**.

Click **Providers**.

Click **Email**.

Scroll down to **SMTP Settings** and enable **Custom SMTP**.

Fill in:

| Field | Value |
|---|---|
| **Sender email** | `noreply@mail.yourapp.com` (use the subdomain you verified in Resend) |
| **Sender name** | Your app name |
| **Host** | `smtp.resend.com` |
| **Port number** | `465` |
| **Username** | `resend` (literally the word "resend") |
| **Password** | Your Resend API key (`re_...`) |

Click **Save**.

Test it: go to **Authentication** → **Users** → click **Invite user** and enter your own email. You should receive the invite from your Resend domain within 30 seconds.

---

## 5. Install the Resend SDK

```bash
npm install resend
```

---

## 6. Add a Send Email Route

Find the user's API route directory and create a send-email endpoint.

For Next.js App Router, create `app/api/email/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { to, subject, html } = await req.json()

  const { data, error } = await resend.emails.send({
    from: 'Your App <noreply@mail.yourapp.com>',
    to,
    subject,
    html,
  })

  if (error) {
    return Response.json({ error }, { status: 500 })
  }

  return Response.json({ id: data?.id })
}
```

Replace `noreply@mail.yourapp.com` with the sender address you set in Supabase.

---

## 7. Verify

Send a test email by calling the route:

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{"to": "your@email.com", "subject": "Test", "html": "<p>It works!</p>"}'
```

Check your inbox. Also check the Resend dashboard → **Emails** to confirm the message was delivered.

Tell the user: "Email is working. Supabase will now send auth emails from your domain, and you can send custom emails from your app."
