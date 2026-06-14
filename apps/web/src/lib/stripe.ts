import { getSupabase, isSupabaseConfigured } from './supabase';

export const STRIPE_PRICE_ID = import.meta.env.VITE_PUBLIC_STRIPE_PRICE_ID ?? '';

export async function redirectToCheckout(userId: string, userEmail: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  if (!STRIPE_PRICE_ID) return { error: 'VITE_PUBLIC_STRIPE_PRICE_ID not set' };

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { priceId: STRIPE_PRICE_ID, userId, userEmail },
    });

    if (error) return { error: error.message };
    if (!data?.url) return { error: 'No checkout URL returned' };

    window.location.href = data.url;
    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

export async function getSubscription(userId: string) {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabase();
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}
