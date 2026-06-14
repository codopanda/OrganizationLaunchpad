# Every.org

Purpose: Donation-focused payment flows and nonprofit fundraising integrations.

Console URL:

- Developer signup: https://www.every.org/signup?redirectUrl=%2Fdeveloper&title=Sign+up

How to get access:

1. Open the developer signup URL above.
2. Sign up or sign in.
3. Complete any account, organization, nonprofit, or verification steps Every.org requires.
4. Record the selected integration method and any keys, IDs, or URLs in the app-specific setup notes.

Environment variables:

- Add provider-specific variables only after the integration method is selected.
- Keep any secret token server-side only, for example in Supabase Edge Function secrets or Cloudflare environment secrets.
- Public donation URLs may be exposed in frontend configuration when they do not include secrets.

Implementation notes:

- Use Every.org as a payment option when the app needs donation-focused flows.
- Keep provider-specific calls inside an adapter or thin redirect module; do not scatter Every.org URLs or API calls through UI components.
- If the flow redirects to an Every.org-hosted page, document the return/callback behavior before wiring success states.

## App Integration Template

Copy this section into the app-specific setup notes when an app chooses Every.org.

```md
## Every.org Payment Setup

Provider: Every.org
Developer signup URL: https://www.every.org/signup?redirectUrl=%2Fdeveloper&title=Sign+up

Account owner:
Organization / nonprofit:
Every.org profile URL:
Developer dashboard URL:

Integration type:
- Hosted donation redirect:
- Embedded donation widget:
- API-backed flow:
- Other:

Frontend configuration:
- Public donation URL:
- Suggested env var: `VITE_PUBLIC_EVERY_ORG_DONATION_URL`
- Button / CTA label:
- Success route:
- Cancel route:

Server-side configuration:
- Required secret names:
- Callback / webhook URL:
- Signature verification method:
- Supabase Edge Function or Worker name:

Adapter notes:
- Application port:
- Adapter path:
- UI entry point:
- Events to track:

Verification checklist:
- [ ] Test donation flow reaches Every.org
- [ ] Return or success route works
- [ ] Cancel or abandoned-flow route works
- [ ] Analytics event is recorded
- [ ] No secret values are exposed to frontend code
```

Ownership:

- The project owner should control the Every.org account and any organization-level settings.

Rotation notes:

- Rotate or revoke any issued credentials from the Every.org developer/account dashboard if they are exposed.
- Update deployment secrets and redeploy after credential changes.
