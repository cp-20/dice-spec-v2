# Plan 005: Verified dead code and leftovers are gone

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 8844f6d..HEAD -- src e2e`
> For every file named in a step, confirm the quoted line still exists before
> editing; a missing line is a STOP condition for that step only (skip it and
> report).

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `8844f6d`, 2026-11-10

## Why this matters

Each item below is code that cannot run or is never read. It was confirmed by
searching every caller. Removing it shrinks what a reader has to rule out and
keeps `knip` and the linter meaningful. Nothing here changes behaviour.

## Current state

Repo conventions that apply: do not delete or reword explanatory comments
that are unrelated to the line you remove (`docs/workflow.md`); comments and
commit messages are Japanese; `pnpm format` is `oxfmt`, lint is `oxlint`
(Biome is not installed, so `biome-ignore` comments have no effect).

Items (each quoted line was read at commit `8844f6d`):

1. `src/app/(app)/analyze-logs/list/_components/AnalysisFilters.tsx:28` —
   both branches are identical:
   `const availableSortOptions = isPublicTab ? sortOptions : sortOptions;`
2. `src/app/(app)/analyze-logs/list/_components/AnalysisListContainer.tsx:36` —
   `<TabsTrigger value="mine" disabled={!authUser}>` sits below an early
   `if (!authUser) { return ... }` at line 21, so `disabled` is always false.
3. `e2e/routing/routes.e2e.ts:35` — the UI is Japanese-only; the English
   alternative never matches:
   `page.getByRole('link', { name: /解析一覧に戻る|Back to analysis list/ })`
4. `src/app/(app)/ccfolia/_components/ccfolia-editor/character-save/saveOperation.ts:31` —
   field `value: SaveIntent` of `SaveFeedback` is written once
   (`characterSave.ts`, search `value:` near `setSaveFeedback`/`feedback`) and
   never read.
5. `src/app/(app)/expect/_components/hooks/useDiceExpecter.ts:74-93` —
   `toggleAutoRecalculation` is defined and returned; no caller.
6. `src/app/(app)/dice/_components/hooks/useQuickInput.ts:62-73` —
   `resetItems` is defined and returned; the only caller is
   `useQuickInput.test.ts`.
7. Eight `biome-ignore` comments, which no installed tool reads:
   `src/shared/components/elements/RichText.tsx:20`,
   `src/shared/components/ui/use-toast.ts:169`,
   `src/shared/lib/groupBy.ts:8`,
   `src/app/(app)/analyze-logs/_components/GameSystemSelect.tsx:20`,
   `src/app/(app)/analyze-logs/_components/hooks/useShareAnalysisResult.tsx:166`,
   `src/app/(app)/expect/page.tsx:26`,
   `src/features/dice-expectation/expecter/tokenizer.ts:11`,
   `src/features/dice-expectation/expecter/parser.ts:54`.

## Commands you will need

| Purpose      | Command             | Expected on success     |
| ------------ | ------------------- | ----------------------- |
| Typecheck    | `pnpm typecheck`    | exit 0, no errors       |
| Tests        | `pnpm test`         | all pass                |
| Lint         | `pnpm lint`         | exit 0, no new warnings |
| Format       | `pnpm format:check` | exit 0                  |
| Unused check | `pnpm dlx knip`     | no "Unused" sections    |

## Scope

**In scope**: only the files named in items 1–7, plus
`src/app/(app)/dice/_components/hooks/useQuickInput.test.ts` and
`src/app/(app)/ccfolia/_components/ccfolia-editor/character-save/characterSave.ts`
where the removed members are referenced.

**Out of scope**:

- `src/shared/components/ui/use-toast.ts` beyond its one `biome-ignore` line.
  It is vendored shadcn code; leave its unused `update`/`dismiss` API alone.
- `duplicateCount` in `src/features/log-analysis/ccfolia/structuredLog.ts`.
  It is unread today but is a product decision (show "N duplicates removed"
  or drop it); do not remove it.
- Any refactor, renaming or reformatting beyond the listed lines.

## Git workflow

- Branch: `advisor/005-remove-verified-dead-code`
- One commit, Japanese message, e.g. `refactor: 到達しない分岐と読まれていない値を削除する`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Items 1–3

1. Replace `availableSortOptions` with `sortOptions` at its use sites and
   delete the declaration; delete `isPublicTab` if it becomes unused.
2. Remove the `disabled={!authUser}` attribute.
3. Change the regex to the plain string `'解析一覧に戻る'`.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 2: Items 4–6

4. Remove `value` from `SaveFeedback` and from the object literal that sets it.
5. Remove `toggleAutoRecalculation` and its entry in the returned object.
6. `useQuickInput.test.ts` calls `resetItems()` at the start of each test
   because every `renderHook` shares Jotai's default store. Clearing
   `localStorage` alone does not reset the atom's in-memory value. Give each
   test its own store instead: render with `{ wrapper: Provider }`
   (`import { Provider } from 'jotai'`, as
   `src/app/(app)/analyze-logs/_components/hooks/useShareDestination.test.tsx`
   does) and add `afterEach(() => localStorage.clear())`. Then delete the
   `resetItems()` calls and remove `resetItems` from the hook.

**Verify**: `pnpm typecheck && pnpm test` → exit 0, all tests pass.

### Step 3: Item 7

Delete each `biome-ignore` comment line. Where the comment carries a reason
after the colon that is still true (for example
`aria-labelledby に紐づいてる`), keep the reason as an ordinary comment.

**Verify**: `grep -rn "biome-ignore" src` → no matches.

### Step 4: Full checks

**Verify**: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test` → all exit 0,
and `pnpm lint 2>&1 | grep -c warning` is not higher than before you started
(record the number before Step 1).

## Done criteria

- [ ] `grep -rn "biome-ignore" src` returns no matches
- [ ] `grep -rn "toggleAutoRecalculation\|resetItems\|Back to analysis list" src e2e` returns no matches
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` all exit 0
- [ ] `pnpm dlx knip` reports no unused files, dependencies or exports
- [ ] `plans/README.md` status row updated

## STOP conditions

- Removing a `biome-ignore` line makes `pnpm lint` report a new warning or
  error on that line. Restore that one comment and report it.
- Any quoted line no longer exists (skip that item, report it).
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- `knip.json` covers `src/**` only. Unused exports under `firebase/test/**`
  are not detected; extending the `project` glob is a separate decision.
