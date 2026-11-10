# Plan 002: Account loading has an explicit error state instead of an endless skeleton

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 8844f6d..HEAD -- src/features/account`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `8844f6d`, 2026-11-10

## Why this matters

The signed-in user's document is exposed as two values, `me` (document or
`null`) and `meLoading` (boolean). "Still loading", "failed to load" and
"gave up" are all encoded as `me === null && meLoading === true`. When the
Firestore listener errors, or the document fails schema validation, nothing
changes that state: the header avatar and the saved-characters list show
skeletons forever, saving is disabled, and the error never reaches Sentry.
One more combination, signed in with `me === null && meLoading === false`,
renders no account menu at all, so the user cannot sign out. After this plan
there is one more observable state, `error`, and the account menu stays
usable in it.

## Current state

- `src/features/account/firebase/accountStore.ts` — owns the subscription.

  ```ts
  // src/features/account/firebase/accountStore.ts:17-19
  const internalMeLoadingAtom = atom(true);

  const internalMeAtom = withAtomEffect(atom<UserDocument | null>(null), (get, set) => {
  ```

  ```ts
  // src/features/account/firebase/accountStore.ts:40-43 — no error callback is passed
  const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, authUser.uid);
  const unsubscribe = onSnapshot(userRef, { includeMetadataChanges: true }, async (snap) => {
    // Firestore emits optimistic snapshots before setDoc reaches the server.
    if (snap.metadata.fromCache || snap.metadata.hasPendingWrites) return;
  ```

  ```ts
  // src/features/account/firebase/accountStore.ts:103 — throws inside the async listener
  const data = v.parse(userDocumentSchema, snap.data({ serverTimestamps: 'estimate' }));
  ```

  ```ts
  // src/features/account/firebase/accountStore.ts:118-125
  export const meAtom = atom((get) => get(internalMeAtom));
  export const meLoadingAtom = atom((get) => get(internalMeLoadingAtom));

  export const useMeStore = () => {
    const me = useAtomValue(meAtom);
    const meLoading = useAtomValue(meLoadingAtom);
    return { me, meLoading };
  };
  ```

- `src/features/account/firebase/accountStore.test.tsx` — existing tests.
  One of them deliberately asserts that a _cancelled sign-out_ after a failed
  first-time document creation leaves the state loading. Keep that behaviour.
- `src/features/account/ui/AuthenticatedUserMenu.tsx` — header menu. It
  returns `null` when there is no `me` and loading has finished (around line 24).
- State transitions as they exist today:

  ```
  auth unknown ─▶ signed out
               └▶ signed in, loading ─ server snapshot ─▶ ready (me)
                                      ├ listener error ──▶ (stays "loading" forever)
                                      └ invalid document ▶ (stays "loading" forever, unhandled rejection)
  ```

- Conventions: state lives in Jotai atoms; effects owned by an atom are
  attached with `withAtomEffect` (`docs/frontend-architecture.md`). Errors are
  reported with `captureClientException` from `@/shared/lib/sentryClient`.
  UI copy, comments and commit messages are Japanese. Per
  `docs/ui-style-guide.md`, red is used only to convey state.

## Commands you will need

| Purpose   | Command                                     | Expected on success |
| --------- | ------------------------------------------- | ------------------- |
| Install   | `pnpm install --frozen-lockfile`            | exit 0              |
| Typecheck | `pnpm typecheck`                            | exit 0, no errors   |
| Tests     | `pnpm exec vitest run src/features/account` | all pass            |
| All tests | `pnpm test`                                 | all pass            |
| Lint      | `pnpm lint`                                 | exit 0              |
| Format    | `pnpm format:check`                         | exit 0              |

## Scope

**In scope**:

- `src/features/account/firebase/accountStore.ts`
- `src/features/account/firebase/accountStore.test.tsx`
- `src/features/account/ui/AuthenticatedUserMenu.tsx`

**Out of scope**:

- The other consumers of `useMeStore` / `meAtom` / `meLoadingAtom`
  (`src/app/(app)/**`). Their existing `me` / `meLoading` contract must keep
  working unchanged: in the new error state they must see `me === null` and
  `meLoading === false`.
- `src/shared/lib/firebase/useFirebaseAuth.ts` — the auth atoms are fine.
- The first-sign-in creation flow (lines 45-100) except for wrapping it so a
  thrown error cannot escape the listener.

## Git workflow

- Branch: `advisor/002-explicit-account-state`
- One commit, Japanese message, e.g.
  `fix: アカウント情報の取得失敗を読み込み中と区別して表示する`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add an error atom and set it from both failure paths

In `accountStore.ts` add `const internalMeErrorAtom = atom(false)` next to
`internalMeLoadingAtom`. Reset it to `false` wherever the effect currently
sets `internalMeLoadingAtom` to `true`. Pass an error callback as the last
argument of `onSnapshot`; in it call `captureClientException(error)`, then set
`internalMeAtom` to `null`, `internalMeLoadingAtom` to `false` and
`internalMeErrorAtom` to `true`. Wrap the `v.parse(...)` call (line 103) in
`try`/`catch` with the same three sets and the same capture, then `return`.
Export `meErrorAtom` (read-only, same pattern as `meLoadingAtom`) and add
`meError` to the object returned by `useMeStore`.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Keep the account menu usable when the document failed to load

In `AuthenticatedUserMenu.tsx`, when the user is signed in and `meError` is
true, render the menu trigger with the default avatar and keep the
ログアウト item available instead of returning `null`. Do not add new copy
beyond one short Japanese line stating that account information could not be
loaded.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Tests

Add two cases to `accountStore.test.tsx`, following the file's existing setup:
the listener's error callback firing, and a snapshot whose data fails
`userDocumentSchema`. Assert `me === null`, `meLoading === false`,
`meError === true`, and that `captureClientException` was called. The existing
cancelled-sign-out test must still pass unchanged.

**Verify**: `pnpm exec vitest run src/features/account` → all pass, including 2 new tests.

### Step 4: Full checks

**Verify**: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test` → all exit 0.

## Done criteria

- [ ] `grep -n "meErrorAtom" src/features/account/firebase/accountStore.ts` matches
- [ ] `onSnapshot(` in `accountStore.ts` is called with an error callback
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` all exit 0
- [ ] `git status --short` lists only in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The existing test "cancelled sign-out leaves loading" (search the test file
  for `signOutWithGuard`) fails after your change.
- Making the menu usable requires changing a file outside the scope list.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- This is the minimal step. Collapsing `me` / `meLoading` / `meError` into one
  discriminated union (`unknown | anonymous | loading | ready | error`) across
  all consumers is a larger follow-up; do it only together with the consumers.
- Two-tab first sign-in can still fail document creation and sign the user
  out (`accountStore.ts:45-91`); that is tracked in `plans/README.md` as a
  separate open item.
