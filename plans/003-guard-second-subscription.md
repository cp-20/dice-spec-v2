# Plan 003: A user cannot end up with two live subscriptions, and cancelling one never downgrades a user who still pays

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 8844f6d..HEAD -- src/features/stripe/server`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (independent of plan 001, but touch `clients.ts` after 001 lands if both are scheduled)
- **Category**: bug
- **Planned at**: commit `8844f6d`, 2026-11-10

## Why this matters

Checkout is refused only when the user document already says `plan: 'pro'`.
That field stays `free` until a webhook arrives and while a subscription is
`incomplete`, `unpaid` or `paused`, and checkout sessions are never reused.
A user who completes checkout twice (two tabs, or going back and starting a
second session) is billed twice. If they then cancel the newer subscription,
the deleted-event handler sets `plan: 'free'` without checking whether another
subscription is still active, and events from the older, still-charging
subscription are ignored as stale from then on. After this plan, the server
refuses to start a checkout while the customer has a non-terminal
subscription, and a deletion only downgrades when no other active
subscription remains.

**Before starting, the operator should check in the Stripe Dashboard
(Settings → Checkout and Payment Links → "Limit customers to one
subscription") whether that setting is enabled. It is not visible in the
repository. Carry out every step either way: what the setting does when two
sessions were both opened before either was paid has not been verified, so
this plan does not rely on it.**

## Current state

- `src/features/stripe/server/app.ts` — Hono routes.

  ```ts
  // src/features/stripe/server/app.ts:55-62
  const userDoc = await getUserById(userId);
  if (userDoc?.plan === 'pro') return c.json({ error: 'User already has an active subscription' }, 409);

  const customerId =
    typeof userDoc?.stripeCustomerId === 'string' && userDoc.stripeCustomerId.length > 0
      ? userDoc.stripeCustomerId
      : undefined;
  if (!customerId) return c.json({ error: 'Stripe customer not found' }, 400);
  ```

- `src/features/stripe/server/subscriptionState.ts` — the status → plan mapping
  and the stale-event check.

  ```ts
  // src/features/stripe/server/subscriptionState.ts:3-4
  export const planForSubscriptionStatus = (status: SubscriptionPayload['status']) =>
    status === 'active' || status === 'trialing' || status === 'past_due' ? 'pro' : 'free';
  ```

- `src/features/stripe/server/handlers/subscription.ts` — the deleted handler
  (`createSubscriptionDeletedHandler`, around lines 302-340) ends with:

  ```ts
  await updateUserById(userId, {
    plan: 'free',
    stripeSubscriptionId: subscription.id,
    updatedAt: new Date(),
  });
  ```

- `src/features/stripe/server/handlers/types.ts` — `HandlerDeps`, the
  dependency object injected into every handler (`getUserById`,
  `updateUserById`, `getSubscriptionById`). Handlers never import the Stripe
  client directly.
- `src/features/stripe/server/clients.ts` — where Stripe/Firestore access
  functions such as `getSubscriptionById` are defined.
- Tests: `src/features/stripe/server/handlers/subscription.test.ts` builds
  `HandlerDeps` from plain in-memory functions; follow that style.
  `src/features/stripe/server/app.test.ts` mocks internal modules and should
  not be extended in that style (`docs/testing.md` allows mocks only at
  external boundaries, with the reason written in the test).
- Conventions: Japanese comments and commit messages; smallest change that
  works (`.agents/skills/ponytail/SKILL.md`).

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

- `src/features/stripe/server/clients.ts`
- `src/features/stripe/server/app.ts`
- `src/features/stripe/server/handlers/types.ts`
- `src/features/stripe/server/handlers/subscription.ts`
- `src/features/stripe/server/handlers/subscription.test.ts`
- `src/features/stripe/server/handlers/checkout.test.ts`,
  `src/features/stripe/server/handlers/invoice.test.ts` — only to add the new
  member to the `HandlerDeps` objects they build
- `src/features/stripe/server/webhook.ts` (only where `HandlerDeps` is assembled)

**Out of scope**:

- `handlers/checkout.ts`, `handlers/invoice.ts` — unchanged.
- Any client code under `src/app/**` and `src/features/stripe/api.ts`. The
  client already handles a 409 from this endpoint.
- Merging the four handlers into one reconcile function. That is a larger
  refactor; do not start it here.

## Git workflow

- Branch: `advisor/003-guard-second-subscription`
- One commit, Japanese message, e.g.
  `fix: 契約中の顧客に二重の契約を作らせず、他の契約が残る解約でプランを下げない`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add one Stripe query for a customer's live subscriptions

In `clients.ts`, add `listLiveSubscriptionsByCustomerId(customerId)` that
calls `subscriptions.list({ customer: customerId, status: 'all', limit: 100 })`
and returns the entries whose `status` is not `canceled` and not
`incomplete_expired`. Add it to `HandlerDeps` in `handlers/types.ts` and to
the place in `webhook.ts` where the real dependencies are assembled
(`createStripeHandlers({ ... })`). Three test files build `HandlerDeps`
objects by hand (`handlers/subscription.test.ts`, `handlers/checkout.test.ts`,
`handlers/invoice.test.ts`); add `listLiveSubscriptionsByCustomerId: async () => []`
to each of those objects so they keep compiling.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Refuse checkout while a live subscription exists, and keep one open session

In `app.ts`, after `customerId` is resolved and before
`checkout.sessions.create`, call the new function; if it returns any
subscription, respond exactly as the existing `plan === 'pro'` branch does
(409, same body). Keep the existing `plan === 'pro'` early return.

A subscription only exists after a checkout is completed, so two sessions
opened before either is paid would both pass that check. Before creating a
session, list the customer's open sessions
(`checkout.sessions.list({ customer: customerId, status: 'open' })`) and
expire each one (`checkout.sessions.expire(id)`), so that at most one
payable session exists per customer. Add a Japanese comment stating the
remaining limit: two requests that arrive at the same instant can still both
create a session. Do not claim in that comment that a Stripe setting closes
this window; that has not been verified.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Do not downgrade when another active subscription remains

`handlers/subscription.ts` writes the plan in three places: the created
handler (`plan: planForSubscriptionStatus(currentSubscription.status)`), the
updated handler (`plan: nextPlan`) and the deleted handler (`plan: 'free'`).
Add one helper in that file that, given the subscription an event is about
and the customer's live subscriptions (the customer id is
`subscription.customer`; check the `SubscriptionPayload` type for its shape),
returns another subscription whose status makes
`planForSubscriptionStatus` return `'pro'`, or `null`.

In every one of the three places, when the value about to be written is
`'free'` and the helper returns a subscription, write
`{ plan: 'pro', stripeSubscriptionId: <that id>, updatedAt: new Date() }`
instead, and return a successful result whose log details say the user stays
on pro because of the remaining subscription. Otherwise keep the current
behaviour. The updated handler needs this too: after the newer subscription
is deleted and the user document points at the older one, a delayed
`updated` event for the deleted subscription is not treated as stale (it was
created later) and would otherwise write `free` again.

**Verify**: `pnpm typecheck` → exit 0.

### Step 4: Tests

In `handlers/subscription.test.ts` add: (1) deletion with no other live
subscription downgrades to `free` (may already exist — keep it);
(2) deletion while another `active` subscription exists leaves `plan: 'pro'`
and stores the remaining subscription's id; (3) deletion while the only other
subscription is `incomplete` still downgrades; (4) the user document points
at an older `active` subscription and an `updated` event arrives for a newer
subscription whose live status is `canceled` — the user stays `pro` with the
older subscription's id.

**Verify**: `pnpm exec vitest run src/features/stripe/server` → all pass.

### Step 5: Full checks

**Verify**: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test` → all exit 0.

## Done criteria

- [ ] `grep -n "listLiveSubscriptionsByCustomerId" src/features/stripe/server/app.ts src/features/stripe/server/handlers/subscription.ts` matches in both files
- [ ] New tests (2), (3) and (4) exist and pass
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` all exit 0
- [ ] `git status --short` lists only in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `SubscriptionPayload` does not carry the customer id and obtaining it would
  need a change outside the scope list.
- The existing stale-event tests in `subscriptionState.test.ts` or
  `subscription.test.ts` fail after your change.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- The Stripe sandbox E2E (`pnpm test:e2e:stripe`) must be run by a maintainer
  with the sandbox key before merge; it covers create and cancel end to end.
- Unverified: whether Stripe's "limit customers to one subscription" setting
  stops two already-open Checkout sessions from both completing. A maintainer
  should try it in the Sandbox (open two sessions for one customer, then
  complete both, one after the other and at the same time) and record the
  result here before treating the setting as the guard for that case.
- The four webhook handlers repeat "parse metadata → load user → stale check →
  write → log". If more rules like this one are added, fold them into a single
  reconcile function first.
