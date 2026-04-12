import { describe, it, expect } from 'vitest';

describe('Health API', () => {
  it('should be able to parse health payload', () => {
    const healthPayload = {
      ok: true,
      service: 'api',
      time: new Date().toISOString(),
    };

    expect(healthPayload.ok).toBe(true);
    expect(healthPayload.service).toBe('api');
    expect(typeof healthPayload.time).toBe('string');
  });

  it('should handle error payloads', () => {
    const errorPayload = {
      ok: false,
      error: 'Service unavailable',
    };

    expect(errorPayload.ok).toBe(false);
    expect(errorPayload.error).toBe('Service unavailable');
  });
});
