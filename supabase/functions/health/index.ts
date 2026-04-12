// Supabase Edge Function - Health Check
// Deploy with: supabase functions deploy health

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

Deno.serve(async (req: Request, env: Env) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const start = Date.now();
    
    // Test Supabase connectivity
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    const health = {
      ok: response.ok,
      service: 'supabase-edge',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      latency_ms: Date.now() - start,
      database: response.ok ? 'connected' : 'disconnected',
    };

    return new Response(JSON.stringify(health), {
      status: response.ok ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      ok: false, 
      service: 'supabase-edge',
      error: String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
