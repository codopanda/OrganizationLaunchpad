import posthog from 'posthog-js';

const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? '';
const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export const isPostHogConfigured = Boolean(key);

if (isPostHogConfigured) {
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    autocapture: true,
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!isPostHogConfigured) return;
  posthog.capture(event, properties);
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (!isPostHogConfigured) return;
  posthog.identify(userId, traits);
}

export function reset() {
  if (!isPostHogConfigured) return;
  posthog.reset();
}

export { posthog };
