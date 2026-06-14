# Analytics — PostHog

You are setting up PostHog to track how users use the app — page views, clicks, signups, conversions. Follow every step in order. Open URLs directly if your environment supports it.

---

## 1. Create a PostHog Account

Open `https://us.posthog.com/signup`

The page shows sign-up fields. Tell the user:

> "I've opened PostHog's sign-up page. Enter your email and a password."

Wait for them to sign up or log in.

PostHog will ask a few onboarding questions (team size, role). Answer them or skip — they do not affect functionality.

---

## 2. Create a Project

After signing up, PostHog prompts you to create a project.

| Field | Value |
|---|---|
| **Project name** | Your app name |

Click **Create project**.

---

## 3. Get Your Project Key

PostHog shows an onboarding screen with a snippet. Look for the value next to `api_key:` or `posthog.init(`. It starts with `phc_`.

If you don't see it, click **Project settings** in the left sidebar → scroll to **Project API key**.

Copy the key.

Also note the **Host** — it will be `https://us.i.posthog.com` for US-hosted projects.

Paste both into your deploy platform:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` or `VITE_PUBLIC_POSTHOG_KEY` | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` or `VITE_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` |

And into `.env.local`:

```
VITE_PUBLIC_POSTHOG_KEY=phc_...
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 4. Install PostHog

```bash
npm install posthog-js
```

---

## 5. Add PostHog to Your App

Find the user's app entry point based on their framework:

**Next.js (App Router)** — create `app/providers.tsx`:

```typescript
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // we'll capture manually
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

Then wrap your root layout in `app/layout.tsx`:

```typescript
import { PHProvider } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  )
}
```

**Vite / SvelteKit / other** — add to your main entry file (`src/main.ts`, `src/routes/+layout.svelte`, etc.):

```typescript
import posthog from 'posthog-js'

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
})
```

---

## 6. Identify Users After Login (Optional but Recommended)

If the user has Supabase set up, add this after a successful login so PostHog links events to real users:

```typescript
import posthog from 'posthog-js'

// After supabase.auth.signIn succeeds:
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  posthog.identify(user.id, {
    email: user.email,
  })
}

// After supabase.auth.signOut:
posthog.reset()
```

---

## 7. Verify

Run the app locally:

```bash
npm run dev
```

Open the app in a browser and navigate around.

Back in PostHog, click **Activity** → **Live events** in the left sidebar.

Within 30 seconds, you should see events appearing — `$pageview`, `$pageleave`, etc.

If no events appear after 1 minute:
- Check the browser console for PostHog errors
- Confirm the API key and host are correct in `.env.local`
- Check if a browser ad blocker is blocking PostHog (disable it for localhost when testing)

---

## 8. What to Watch Next

Once data is flowing, the most useful things to set up in PostHog:

- **Funnels** — See where users drop off (e.g. visited pricing → started checkout → completed payment)
- **Session replay** — Watch recordings of user sessions to see exactly what they do
- **Feature flags** — Ship features to a percentage of users

All of these are in the PostHog left sidebar under **Product analytics**, **Session replay**, and **Feature flags**.

Tell the user: "PostHog is tracking your app. Visit the PostHog dashboard to see live activity and set up funnels once you have some users."
