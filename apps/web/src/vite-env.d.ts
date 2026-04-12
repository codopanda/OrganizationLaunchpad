/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL?: string;
  readonly VITE_PUBLIC_SUPABASE_URL?: string;
  readonly VITE_PUBLIC_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace svelteHTML {
  interface IntrinsicElements {
    'organization-launchpad-auth-form': {
      mode?: 'login' | 'signup';
      'success-path'?: string;
    };
    'organization-launchpad-auth-guard': {
      heading?: string;
      message?: string;
    };
    'organization-launchpad-auth-callback': {
      'success-path'?: string;
      'fallback-path'?: string;
    };
  }
}
