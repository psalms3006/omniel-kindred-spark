# Deploying OMNIEL

The site is a TanStack Start app built by Nitro for Cloudflare Workers, served
from the Worker `omniel-evolve` with `omniel.com.ng` attached as a custom
domain.

The Worker keeps the name `omniel-evolve` even though this repository is
`omniel-kindred-spark`. That Worker is what the live domain is bound to;
renaming it would create a second Worker and leave omniel.com.ng serving the
old one.

Deployment used to happen through a third-party editor. It no longer does:
`wrangler.json` in the repository root is the deploy configuration, and it is
checked in so the Worker's shape is reviewable rather than generated.

## One-time setup

### 1. Cloudflare API token

The token in `.env` needs these permissions. A token with only read access will
fail at the first write with `Authentication error`.

| Permission | Level |
| --- | --- |
| Workers Scripts | Edit |
| D1 | Edit |
| Account Settings | Read |
| DNS (zone omniel.com.ng) | Edit |

### 2. Create the enquiries database

```sh
npx wrangler d1 create omniel-enquiries
```

Copy the `database_id` it prints into `wrangler.json`, replacing
`REPLACE_WITH_D1_DATABASE_ID`. Then apply the schema:

```sh
npx wrangler d1 migrations apply omniel-enquiries --remote
```

Until this is done the site still works, but enquiries are emailed only and
not stored. The handler logs `MISSING REQUIRED CONFIGURATION: D1 binding
ENQUIRIES_DB` on every submission so the gap is visible rather than silent.

### 3. Worker secrets

Runtime configuration lives in Cloudflare, not in the repository. Set each of
these once:

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
npx wrangler secret put OMNIEL_ENQUIRY_EMAIL
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put VAPI_SERVER_SECRET
```

`VITE_`-prefixed values are compiled into the bundle at build time and are not
secrets, so they belong in `.env`, not here.

`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are deployment tooling only.
No code in the Worker reads them, and they must not be added as Worker secrets.

## Deploying

```sh
npm run build
npx wrangler deploy
```

`wrangler deploy` preserves existing secrets. It does replace plain-text vars
with whatever is in `wrangler.json`, which is why every piece of runtime
configuration here is a secret rather than a var.

## Configuring the voice assistant

The tool definitions in `src/lib/vapi-integration/tool-registry.ts` are the
source of truth. Push them to Vapi with:

```sh
node --env-file=.env scripts/configure-vapi.ts          # show the plan
node --env-file=.env scripts/configure-vapi.ts --apply  # write it
```

The script is idempotent: tools are matched by name and updated in place.
It never touches the system prompt or knowledge base, which are maintained in
the Vapi dashboard.

Do not create tools by hand in the dashboard. That is how the account acquired
a tool named `function_tool`, which no code could ever dispatch.

## Verifying a deployment

```sh
# Should be 400 (route alive, body rejected), never 404.
curl -i -X POST https://omniel.com.ng/api/enquiry \
  -H 'Content-Type: application/json' -d 'not-json'

# Should be 401 (secret enforced), never 404 or 200.
curl -i -X POST https://omniel.com.ng/api/vapi/webhook \
  -H 'Content-Type: application/json' -H 'x-vapi-secret: wrong' -d '{}'
```

Enquiries that were stored but never delivered can be found and replayed:

```sh
npx wrangler d1 execute omniel-enquiries --remote \
  --command "SELECT id, email, created_at, delivery_error FROM enquiries WHERE admin_notified = 0 ORDER BY created_at DESC"
```
