AGENTS.md や docs は特定の画面や変更作業に依存しない形で記述し、変更履歴や検討過程を残さない。
コメントやコミットメッセージは日本語で書く。

`ponytail` スキルに従い、必要十分な実装に留める。

- UIを追加・変更・レビューするときは、実装前に docs/ui-style-guide.md 読み、デザイン判断の正本として扱う。
- フロントエンドコンポーネントやクライアント状態を追加・変更・レビューするときは、実装前に docs/frontend-architecture.md を読む。
- コードレビューするときは、実施前に docs/code-review.md を読む。
- テストを追加・変更するときは、実装前に docs/testing.md を読む。
- 変更作業では docs/workflow.md に従う。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
