# PostHog Setup

[PostHog](https://posthog.com) provides error tracking, performance monitoring, and product analytics in a single platform.

## Step 1: Create a PostHog Account

1. Go to [https://posthog.com/](https://posthog.com/)
2. Sign up with email or GitHub
3. Create an organization

## Step 2: Create a Project

1. In PostHog dashboard, click **Settings** → **Projects**
2. Click **+ New project**
3. Select **Web** for frontend
4. Copy your **API key** and **instance address**

## Step 3: Install SDK in Svelte App

### Installation

```bash
cd apps/web
npm install posthog-js
```

### Configuration

Create `src/lib/posthog.ts`:

```typescript
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  loaded: (posthog) => {
    if (import.meta.env.DEV) posthog.debug();
  },
});
```

Add to your root layout or `src/main.ts`:

```typescript
import './lib/posthog';
```

Set environment variables:

```bash
VITE_POSTHOG_API_KEY=phc_your-api-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

## Step 4: Install SDK in Cloudflare Worker

### Installation

```bash
cd workers/api
npm install posthog-js
```

### Configuration

Create `src/lib/posthog.ts`:

```typescript
import { PostHog } from 'posthog-js';

export function createPostHogClient(apiKey: string, host: string) {
  return new PostHog(apiKey, {
    host,
    flushAt: 20,
    flushInterval: 10000,
  });
}
```

In your Worker:

```typescript
import { createPostHogClient } from './lib/posthog';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const posthog = createPostHogClient(env.POSTHOG_API_KEY, env.POSTHOG_HOST);

    ctx.waitUntil(posthog.flush());

    return handleRequest(request, env, ctx);
  },
};
```

Set secrets:

```bash
wrangler secret put POSTHOG_API_KEY
wrangler secret put POSTHOG_HOST
```

## Step 5: Track Events

### Page Views

Automatic with `capture_pageview: true` in init.

### Custom Events

```typescript
import posthog from 'posthog-js';

// Simple event
posthog.capture('button_clicked');

// With properties
posthog.capture('purchase', {
  product: 'Pro Plan',
  value: 99,
  currency: 'USD',
});
```

### Identifying Users

```typescript
// On login
posthog.identify({
  distinctId: user.id,
  email: user.email,
  name: user.name,
});

// On signup
posthog.alias({
  distinctId: anonymousId,
  alias: user.id,
});
```

### Feature Flags

```typescript
const isPro = posthog.isFeatureEnabled('pro-plan', { user_id: user.id });

if (isPro) {
  // Show pro features
}
```

## Step 6: Error Tracking

### Capture Errors in Svelte

```typescript
import posthog from 'posthog-js';

window.addEventListener('error', (event) => {
  posthog.captureException(event.error, {
    level: 'error',
    timestamp: new Date().toISOString(),
  });
});
```

### Capture Console Errors

```typescript
const originalConsoleError = console.error;
console.error = (...args) => {
  posthog.capture('console_error', {
    message: args.join(' '),
    stack: new Error().stack,
  });
  originalConsoleError.apply(console, args);
};
```

### Ignoring Errors

```typescript
posthog.init('key', {
  ignore_split: ['ResizeObserver loop', 'Non-Error promise rejection'],
});
```

## Step 7: Session Replay

Enable in init:

```typescript
posthog.init('key', {
  session_recording: {
    maskAllInputs: true,
    maskTextSelector: '.mask-me',
  },
});
```

Exclude sensitive routes:

```typescript
posthog.startSessionRecording(['/admin', '/settings']);
```

## Environment Variables

| Variable               | Where           | Purpose                      |
| ---------------------- | --------------- | ---------------------------- |
| `VITE_POSTHOG_API_KEY` | `apps/web`      | PostHog API key for frontend |
| `VITE_POSTHOG_HOST`    | `apps/web`      | PostHog instance URL         |
| `POSTHOG_API_KEY`      | Worker (secret) | PostHog API key for backend  |
| `POSTHOG_HOST`         | Worker (secret) | PostHog instance URL         |

## Privacy Considerations

### Data Minimization

```typescript
posthog.init('key', {
  property_blacklist: ['email', 'password', 'creditCard'],
});
```

### GDPR Compliance

1. Set `opt_out: true` by default
2. Ask for consent before initializing PostHog
3. Use ` posthog.opt_out_capturing()` after consent withdrawal
4. Add privacy policy disclosure

### Sensitive Fields

| Field     | Risk     | Recommendation           |
| --------- | -------- | ------------------------ |
| `email`   | PII      | Use hash or exclude      |
| `ip`      | PII      | PostHog defaults to hash |
| `cookies` | Tracking | Use `session_id` instead |

## Verification Checklist

- [ ] PostHog account created
- [ ] Project created for frontend
- [ ] API key copied and set as environment variable
- [ ] SDK installed and initialized in Svelte app
- [ ] SDK installed in Cloudflare Worker
- [ ] Test event sent to verify integration
- [ ] Session replay configured (if desired)
- [ ] Privacy settings reviewed

## Troubleshooting

### Events not appearing

1. Verify API key is correct
2. Check `api_host` matches your instance
3. Ensure CORS headers allow the endpoint
4. Check network tab for failed requests

### Performance overhead

1. Reduce `flushAt` to 10
2. Increase `flushInterval` to 30000
3. Disable `capture_pageview` if not needed

## Cost

- **Free**: 1M events/month, 5 team members
- **Growth**: $24/month - 5M events, 10 team members
- **Enterprise**: Contact sales for pricing

## Next Steps

- Configure [Supabase](./supabase.md) for database and auth
- Set up [Resend](./resend.md) for emails
- Configure [Cloudflare](./cloudflare.md) for edge hosting
