# Plan 001: Billing-server writes to `users/{uid}` change only the fields they intend to change

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 8844f6d..HEAD -- src/features/stripe/server/clients.ts src/features/stripe/server/clients.test.ts`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `8844f6d`, 2026-11-10

## Why this matters

Every Stripe webhook (checkout, renewal, cancellation) updates the user
document through a library call that reads the whole document, merges in
memory, and writes the whole document back with no field mask and no
precondition. Any browser write that lands between that read and write is
silently reverted. The browser increments `analysisCount` and
`ccfoliaCharacterCount` on the same document, and the Firestore rules only
ever allow those counters to move by ±1 together with a create or delete, so
one lost increment desyncs a user's quota permanently (a free user can end up
unable to save, or unable to delete). The round trip also truncates
timestamps such as `createdAt` to milliseconds. After this plan, a billing
write changes exactly the fields it names.

## Current state

- `src/features/stripe/server/clients.ts` — creates the REST Firestore client
  and exposes the user-document helpers used by every webhook handler.

  ```ts
  // src/features/stripe/server/clients.ts:59-71
  export const updateExistingUserById = async (
    client: Pick<ReturnType<typeof createFirestoreClient>, 'get' | 'update'>,
    userId: string,
    data: Record<string, unknown>,
  ) => {
    if (!(await client.get(FIREBASE_COLLECTIONS.users, userId))) throw new Error('User not found');
    await client.update(FIREBASE_COLLECTIONS.users, userId, data);
  };

  export const updateUserById = async (userId: string, data: Record<string, unknown>) => {
    await updateExistingUserById(getFirestoreClient(), userId, data);
  };
  ```

- `node_modules/firebase-rest-firestore/dist/esm/client.js` (`update`, around
  lines 312-380) — the library method. It calls `this.get(...)`, builds
  `data = { ...existingDoc, ...data }`, converts the merged object and sends
  `fetch(url, { method: "PATCH", headers, body })` with **no** `updateMask`
  and **no** `currentDocument` precondition.
- `node_modules/firebase-rest-firestore/dist/esm/utils/converter.js:18,82` —
  timestamps are written with `value.toISOString()` and read with
  `new Date(...)`, so they lose sub-millisecond precision on every round trip.
- Callers pass small objects such as
  `{ plan: 'free', stripeSubscriptionId: subscription.id, updatedAt: new Date() }`
  (`src/features/stripe/server/handlers/subscription.ts`, three sites) and
  `{ plan: 'pro', stripeSubscriptionId, updatedAt }`
  (`src/features/stripe/server/handlers/checkout.ts`). Keys are always
  top-level field names; none use dot notation.
- `src/features/stripe/server/clients.test.ts` — existing unit test for
  `updateExistingUserById`. Read it before changing the function signature.
- Repo conventions: comments and commit messages are written in Japanese
  (`AGENTS.md`). Tests follow `docs/testing.md`: mocks only at external
  boundaries, with the reason written in the test. Keep the change as small
  as possible (`.agents/skills/ponytail/SKILL.md`).

The Firestore REST API supports exactly what is needed:
`PATCH .../documents/users/{id}?updateMask.fieldPaths=plan&updateMask.fieldPaths=updatedAt&currentDocument.exists=true`
writes only the masked fields and fails with `NOT_FOUND`/`FAILED_PRECONDITION`
when the document does not exist.

## Commands you will need

| Purpose   | Command                                           | Expected on success |
| --------- | ------------------------------------------------- | ------------------- |
| Install   | `pnpm install --frozen-lockfile`                  | exit 0              |
| Typecheck | `pnpm typecheck`                                  | exit 0, no errors   |
| Tests     | `pnpm exec vitest run src/features/stripe/server` | all pass            |
| All tests | `pnpm test`                                       | all pass            |
| Lint      | `pnpm lint`                                       | exit 0              |
| Format    | `pnpm format:check`                               | exit 0              |

## Scope

**In scope** (the only files you should modify):

- `src/features/stripe/server/clients.ts`
- `src/features/stripe/server/clients.test.ts`

**Out of scope** (do NOT touch, even though they look related):

- `src/features/stripe/server/handlers/**` — callers keep calling
  `updateUserById(userId, data)` with the same arguments.
- `firebase/firestore.rules` — no rules change is needed.
- `node_modules/**` and `patches/**` — do not patch the library.
- `e2e/**` — the Stripe E2E needs a sandbox key you do not have.

## Git workflow

- Branch: `advisor/001-mask-billing-user-writes`
- One commit; message in Japanese with a conventional prefix, e.g.
  `fix: 課金サーバーの users 更新を指定した項目だけに限定する`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Find how the library exposes its request URL and auth headers

Read `node_modules/firebase-rest-firestore/dist/esm/client.js`. Identify
whether the client object returned by `createFirestoreClient` gives access to
(a) the document URL for a collection/id and (b) the authorization headers
(the `update` method uses `this.pathUtil.getDocumentPath(...)` and
`await this.prepareHeaders()`), and how values are converted
(`convertToFirestoreDocument`). Decide which of these are reachable from
`clients.ts` through the package's public exports
(`node_modules/firebase-rest-firestore/package.json` → `exports`).

**Verify**: you can state, with file and line, how to obtain the URL, the
headers and the converted `fields` object without importing from a path the
package does not export. If you cannot, this is a STOP condition.

### Step 2: Replace the read-merge-write with one masked, preconditioned PATCH

In `clients.ts`, change `updateExistingUserById` so that it sends a single
`PATCH` to the user document URL with one `updateMask.fieldPaths=<key>` query
parameter per key of `data` and `currentDocument.exists=true`, with a body
containing only the converted `data` fields. Throw `new Error('User not found')`
when Firestore answers that the document does not exist (HTTP 404, or a 400/409
whose `error.status` is `NOT_FOUND` or `FAILED_PRECONDITION`), and throw an
error including the HTTP status for any other non-2xx response. Remove the
separate existence `get`. Add a Japanese comment explaining why the mask and
precondition are used (concurrent browser writes to the same document must
not be reverted).

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Update the unit test

Rewrite `clients.test.ts` for the new behaviour. Stub the network boundary
only (global `fetch`), and state the reason in the test as `docs/testing.md`
requires. Cover: (1) the request is a `PATCH` whose query contains exactly
the keys of `data` as `updateMask.fieldPaths` and `currentDocument.exists=true`;
(2) the body contains only those fields; (3) a "document does not exist"
response rejects with `User not found`; (4) another error status rejects.

**Verify**: `pnpm exec vitest run src/features/stripe/server` → all pass.

### Step 4: Full checks

**Verify**: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test` → all exit 0.

## Test plan

- Tests listed in Step 3, in `src/features/stripe/server/clients.test.ts`.
- Pattern to follow for a boundary stub with a stated reason:
  `src/features/stripe/server/webhook.test.ts`.

## Done criteria

- [ ] `grep -n "client.update(" src/features/stripe/server/clients.ts` returns no matches
- [ ] `grep -n "updateMask.fieldPaths" src/features/stripe/server/clients.ts` returns at least one match
- [ ] `grep -n "currentDocument.exists" src/features/stripe/server/clients.ts` returns at least one match
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` all exit 0
- [ ] `git status --short` lists only the two in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The library gives no supported way to obtain auth headers or the document
  URL (Step 1). Report what is and is not exported; do not copy the library's
  token-signing code into the repo.
- Any caller of `updateUserById` passes a key containing `.` or a nested
  object whose sub-fields must be merged rather than replaced.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- The Stripe sandbox E2E (`pnpm test:e2e:stripe`, needs `STRIPE_E2E_SECRET_KEY`)
  exercises these writes end to end; a maintainer should run it before merge.
- If a future handler needs to delete a field or write a nested path, extend
  the mask handling deliberately; do not fall back to whole-document writes.
- Reviewer: check that the precondition error mapping matches what the
  Firestore emulator actually returns.
