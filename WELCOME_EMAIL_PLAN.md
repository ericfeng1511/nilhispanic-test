# Welcome Email Feature — Implementation Plan

## Goal

After a user verifies their email (clicks the link in the Supabase verification email), automatically send them a "Welcome to NILHispanic" intro email via Brevo's transactional email API.

---

## Project Context

- **Repo:** `nilhispanic-test` (local), live site at `nilhispanic.com`
- **Stack:** React 18 + TypeScript, Vite, Shadcn/ui, Supabase (auth + DB), TanStack Query, EmailJS
- **Email setup (current):**
  - **Supabase auth emails** (verification link, password reset) are sent via **Brevo SMTP** — configured in the Supabase dashboard under Authentication → SMTP Settings. This uses an SMTP key, NOT a Brevo API key.
  - **EmailJS** is also in the stack (`VITE_EMAILJS_*` env vars) and is used for other client-side emails (e.g. contact forms). It is NOT used for the welcome email feature.
- **No Supabase Edge Functions have been deployed before** — this will be the first one.

---

## Why This Approach (Key Decisions)

### Server-side Edge Function, NOT client-side

The verification flow ends at `src/pages/AuthVerify.tsx`, which is purely a redirect page. Sending the welcome email from the client (e.g. in `AuthVerify.tsx`) would be unreliable — if the user closes the tab before the page loads, the email never sends. A server-side trigger fires regardless of client behavior.

### Brevo API (not SMTP, not EmailJS)

Brevo is already the email provider for this project. Brevo has a REST API for transactional emails that is separate from SMTP. Using it keeps one provider for everything and avoids adding a second service. EmailJS is client-side only and not suitable for a server-side function.

### Database Webhook → Edge Function

Supabase fires a database webhook when a row in `auth.users` is updated. We filter for when `email_confirmed_at` changes from `NULL` to a non-null value — that's the exact moment a user verifies their email. This is available on all Supabase plans and is the most reliable trigger.

---

## Prerequisites (Things to Do Before Writing Code)

### 1. Generate a Brevo API Key

The existing SMTP key will NOT work for the REST API — they are different credentials.

1. Log into Brevo → click your avatar (top right) → **SMTP & API** → **API Keys** tab
2. Click **Generate a new API key**, name it something like `nilhispanic-edge-functions`
3. Copy the key (starts with `xkeysib-`) — you only see it once
4. You will store this as a Supabase secret in a later step (do NOT put it in `.env` or commit it)

### 2. Find Your Supabase Project Ref

- Supabase dashboard → your project → **Settings** → **General**
- The project ref is a short string like `abcdefghijklmnop`

### 3. Install the Supabase CLI

```bash
npm install -g supabase
```

Then log in and link the project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

`supabase login` opens a browser for OAuth. `supabase link` connects your local CLI to the remote project.

---

## Implementation Steps

### Step 1 — Create the Edge Function

From the repo root, scaffold the function:

```bash
supabase functions new send-welcome-email
```

This creates `supabase/functions/send-welcome-email/index.ts`.

Replace its contents with the following:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

serve(async (req: Request) => {
  try {
    const payload = await req.json();

    // Supabase database webhooks send the full row as `record`
    const record = payload?.record;
    if (!record) {
      return new Response('No record in payload', { status: 400 });
    }

    // Only send welcome email when email_confirmed_at just became non-null
    // (old_record will have email_confirmed_at: null)
    const oldRecord = payload?.old_record;
    if (!record.email_confirmed_at || (oldRecord && oldRecord.email_confirmed_at)) {
      // Either not confirmed yet, or was already confirmed before (no change)
      return new Response('Not a new confirmation event', { status: 200 });
    }

    const email = record.email;
    const fullName = record.raw_user_meta_data?.full_name || 'Athlete';

    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY secret is not set');
      return new Response('Missing API key', { status: 500 });
    }

    const emailPayload = {
      sender: { name: 'NILHispanic', email: 'no-reply@nilhispanic.com' },
      to: [{ email, name: fullName }],
      subject: 'Welcome to NILHispanic!',
      htmlContent: `
        <h1>Welcome, ${fullName}!</h1>
        <p>Your email has been verified and your NILHispanic account is ready.</p>
        <p>
          <!-- Add your welcome email body content here -->
          We're excited to have you as part of the community.
        </p>
        <p>— The NILHispanic Team</p>
      `,
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Brevo API error:', errText);
      return new Response('Failed to send email', { status: 500 });
    }

    console.log(`Welcome email sent to ${email}`);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
```

**Notes on the email content:**
- The `sender.email` (`no-reply@nilhispanic.com`) must be a verified sender domain in Brevo — confirm this in your Brevo dashboard under **Senders & IPs → Domains**. If not verified, use whichever email address you have verified.
- Customize `htmlContent` with the actual welcome copy before shipping.
- `raw_user_meta_data.full_name` is set during signup in `AuthContext.tsx:258` — it will always be present for users who went through the signup wizard.

### Step 2 — Store the Brevo API Key as a Secret

```bash
supabase secrets set BREVO_API_KEY=xkeysib-your-key-here
```

Verify it was stored:

```bash
supabase secrets list
```

Secrets are encrypted and injected as environment variables into your Edge Function at runtime. Never put the API key in `.env` or source code.

### Step 3 — Deploy the Edge Function

```bash
supabase functions deploy send-welcome-email
```

After deploying, note the function URL — it looks like:
```
https://<project-ref>.supabase.co/functions/v1/send-welcome-email
```

You can also find it in the Supabase dashboard under **Edge Functions**.

### Step 4 — Set Up the Database Webhook

In the Supabase dashboard:

1. Go to **Database → Webhooks** (also listed as "Database Webhooks" in some versions)
2. Click **Create a new webhook**
3. Fill in:
   - **Name:** `on-email-confirmed`
   - **Table:** `auth.users` ← important: this is the `auth` schema, not `public`
   - **Events:** check `UPDATE` only
   - **Webhook URL:** your Edge Function URL from Step 3
   - **HTTP method:** POST
   - **Headers:** add `Authorization: Bearer <your-supabase-service-role-key>`
     - Service role key is in Supabase → Settings → API → `service_role` key
4. Save

**Why the Authorization header?** Supabase Edge Functions can be set to require a valid JWT. Adding the service role key in the header ensures the webhook call is authenticated.

> **Alternative:** If the webhook UI does not have a header field, or if you want to skip auth for simplicity, you can set `--no-verify-jwt` when deploying: `supabase functions deploy send-welcome-email --no-verify-jwt`. Then no auth header is needed on the webhook. Only do this if the function is otherwise safe (it only sends emails, no destructive DB writes).

---

## File Changes Summary

| File | Change |
|------|--------|
| `supabase/functions/send-welcome-email/index.ts` | New file — the Edge Function |
| No changes to existing frontend files | The trigger is entirely server-side |

`src/pages/AuthVerify.tsx` and `src/contexts/AuthContext.tsx` are **not modified**.

---

## How the Existing Auth Flow Works (for reference)

1. User signs up via `AuthModal.tsx` → `AuthContext.signUp()` → `supabase.auth.signUp()` with `emailRedirectTo: 'https://nilhispanic.com/auth/verify'`
2. Supabase sends a verification email through Brevo SMTP
3. User clicks the link → lands on `/auth/verify` → `AuthVerify.tsx`
4. `AuthVerify.tsx` reads user role and redirects to the appropriate dashboard
5. **(New)** Simultaneously, Supabase updates `email_confirmed_at` on the `auth.users` row → database webhook fires → Edge Function calls Brevo API → welcome email is delivered

Steps 4 and 5 happen independently — the welcome email does not block or depend on the redirect.

---

## Testing

1. Create a new test account with a real email address you can access
2. Click the verification link in the email
3. Check that:
   - You are redirected to the correct dashboard (existing behavior unchanged)
   - A welcome email arrives in your inbox within ~30 seconds
4. Check Edge Function logs in Supabase dashboard → **Edge Functions → send-welcome-email → Logs** if the email does not arrive

To avoid spamming yourself during testing, you can temporarily log the email payload to the console instead of calling Brevo, then check the logs.

---

## Potential Gotchas

- **`auth.users` webhook may need special permissions** — some Supabase plans restrict webhooks on `auth` schema tables. If the webhook doesn't fire, try using a Postgres trigger with `pg_net` instead (ask Claude for this alternative if needed).
- **Duplicate emails** — the `old_record.email_confirmed_at` check in the Edge Function guards against re-sending if Supabase fires multiple UPDATE events on the same row. Do not remove this guard.
- **Sender domain** — Brevo requires the `sender.email` to be from a verified domain. If `nilhispanic.com` isn't verified in Brevo, use the address you registered with or verify the domain first.
- **Cold start latency** — Supabase Edge Functions have a cold start. The welcome email may take 5–15 seconds to arrive after verification, which is fine.
