import { cleanup } from '@testing-library/svelte';
import { afterEach, vi } from 'vitest';

(globalThis as { fetch?: unknown }).fetch = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
