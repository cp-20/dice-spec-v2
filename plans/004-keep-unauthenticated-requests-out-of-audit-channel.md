# Plan 004: Requests that fail authentication no longer post to the Stripe audit Discord channel

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 8844f6d..HEAD -- src/features/stripe/server/logger.ts src/features/stripe/server/auth.ts src/features/stripe/server/app.ts src/features/stripe/server/webhook.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `8844f6d`, 2026-11-10

## Why this matters

Every log entry of the billing API is posted to a Discord audit webhook. Three
of those entries are produced _before_ the caller is authenticated: a missing
or malformed `Authorization` header, a missing `stripe-signature` header, and
a signature that does not verify. Anyone on the internet can therefore make
the Worker post to Discord as often as they like. Discord rate-limits the
webhook, failed posts are not retried, and so genuine audit entries for
payments and cancellations sent during such a burst are lost. After this plan,
rejections of unauthenticated callers are written to the Worker's console log
only.

## Current state

- `src/features/stripe/server/logger.ts` — `sendStripeLog` (around lines
  201-250) always logs to `console` and always posts to the audit webhook:

  ```ts
  console.log(`[Stripe][${log.level}]`, consolePayload);

  const requests = [
    postDiscordWebhook(
      () => runtimeEnv.stripe.auditDiscordWebhookUrl,
      { content: buildAuditContent(log, timestamp) },
      'audit',
    ),
  ];

  if (log.notify || log.level === 'error') {
  ```

  `scheduleStripeLog` in the same file is the fire-and-forget wrapper callers use.

- The three pre-authentication call sites:

  ```ts
  // src/features/stripe/server/auth.ts:53-57
  const idToken = getBearerToken(authorizationHeader);
  if (!idToken) {
    scheduleStripeLog({ level: 'warning', eventType, message: 'Missing or invalid authorization header' });
    return null;
  }
  ```

  ```ts
  // src/features/stripe/server/app.ts:126-133
  if (!signature) {
    scheduleStripeLog({
      level: 'warning',
      eventType: 'webhook',
      message: 'Missing Stripe signature',
      error: new Error('Missing signature header'),
    });
    return c.json({ error: 'Missing signature' }, 400);
  }
  ```

  ```ts
  // src/features/stripe/server/webhook.ts:44-52
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    scheduleStripeLog({
      level: 'warning',
      eventType: 'webhook',
      message: 'Webhook signature verification failed',
      error,
    });
    return null;
  }
  ```

- Tests: `logger.test.ts`, `auth.test.ts`, `webhook.test.ts` in the same
  directory. Read them first; some assert on these log calls.
- The `StripeLog` type is defined in `logger.ts` (fields include `level`,
  `eventType`, `message`, `userId`, `details`, `error`, `notify`).
- Conventions: Japanese comments and commit messages; smallest change that
  works. Do not add configuration for values that never change.

## Commands you will need

| Purpose   | Command                                           | Expected on success |
| --------- | ------------------------------------------------- | ------------------- |
| Typecheck | `pnpm typecheck`                                  | exit 0, no errors   |
| Tests     | `pnpm exec vitest run src/features/stripe/server` | all pass            |
| All tests | `pnpm test`                                       | all pass            |
| Lint      | `pnpm lint`                                       | exit 0              |
| Format    | `pnpm format:check`                               | exit 0              |

## Scope

**In scope**:

- `src/features/stripe/server/logger.ts`
- `src/features/stripe/server/logger.test.ts`
- `src/features/stripe/server/auth.ts`, `auth.test.ts`
- `src/features/stripe/server/app.ts` (the one call site above only)
- `src/features/stripe/server/webhook.ts`, `webhook.test.ts` (the one call site above only)

**Out of scope**:

- Log calls made _after_ a caller is authenticated or a signature is verified.
  Those must keep posting to Discord exactly as today.
- The token-verification failure branch in `auth.ts` (the `catch` around line 74) when its level is `'error'` — an identity-provider outage must still alert.
- Rate limiting, sampling or batching. Not needed for this fix.

## Git workflow

- Branch: `advisor/004-quiet-unauthenticated-audit-logs`
- One commit, Japanese message, e.g.
  `fix: 認証前に拒否したリクエストを監査用 Discord へ送らない`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a console-only flag to the log type

In `logger.ts`, add an optional boolean field `consoleOnly` to `StripeLog`.
In `sendStripeLog`, return right after the `console.log(...)` line when it is
true. Add a Japanese comment on the field: unauthenticated callers can trigger
these entries at will, so they must not consume the Discord webhook's rate limit.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Mark the pre-authentication entries

Set `consoleOnly: true` on the three call sites quoted above, and on the
`'No Firebase user was resolved from ID token'` entry in `auth.ts` (line ~62),
which an arbitrary token can also trigger. In the `catch` of
`getAuthenticatedUser`, set `consoleOnly: true` only when the level is
`'warning'` (the `FirebaseUserError` case).

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Tests

In `logger.test.ts` add one test: a log with `consoleOnly: true` performs no
`fetch`. Update any assertion in `auth.test.ts` / `webhook.test.ts` that
compares the exact log object so that it includes `consoleOnly: true`.

**Verify**: `pnpm exec vitest run src/features/stripe/server` → all pass.

### Step 4: Full checks

**Verify**: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test` → all exit 0.

## Done criteria

- [ ] `grep -c "consoleOnly: true" src/features/stripe/server/auth.ts` is at least 2
- [ ] `grep -c "consoleOnly: true" src/features/stripe/server/app.ts src/features/stripe/server/webhook.ts` shows 1 in each file
- [ ] New `logger.test.ts` case exists and passes
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` all exit 0
- [ ] `git status --short` lists only in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `sendStripeLog` no longer has the shape quoted above (for example the
  console line was removed), so "return after console" would drop the entry.
- A test asserts that one of these rejections must reach Discord. Report it —
  that would mean the current behaviour is intentional.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Worker console output is retained by Cloudflare observability
  (`cloudflare.config.ts` enables it), so these rejections stay searchable.
- If probing needs to be visible in Discord later, add a periodic summary
  rather than one message per request.
