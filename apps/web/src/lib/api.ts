import { isSupabaseConfigured } from './supabase';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL ?? '';
const supabaseEdgeUrl = supabaseUrl 
  ? `${supabaseUrl}/functions/v1` 
  : '';

export type HealthPayload = {
  ok: boolean;
  service: string;
  version?: string;
  timestamp?: string;
  latency_ms?: number;
  error?: string;
};

export async function fetchHealth(): Promise<HealthPayload> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      service: 'supabase-edge',
      error: 'Supabase not configured',
    };
  }

  const url = `${supabaseEdgeUrl}/health`;
  const r = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!r.ok) {
    throw new Error(`HTTP ${r.status}`);
  }

  return r.json() as Promise<HealthPayload>;
}
