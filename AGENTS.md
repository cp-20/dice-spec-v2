AGENTS.md や docs は特定の画面や変更作業に依存しない形で記述し、変更履歴や検討過程を残さない。
コメントやコミットメッセージは日本語で書く。

コードの追加・修正・リファクタリング・レビュー、実装方式や依存ライブラリの選定では、[ponytail](.agents/skills/ponytail/SKILL.md) を読み、必要十分な実装に留める。文章だけの編集・翻訳・要約には適用しない。明示的に指定されたスキルは読む。

以下は作業内容に該当するものだけ、判断・実装・レビューの前に読む。途中で対象が広がったら、その時点で必要なガイドを追加する。同じ作業で既に読んだ内容は、更新されていなければ読み直さない。

| 作業内容                                                                                            | 読み込むガイド                                                         |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| レイアウト、配色、タイポグラフィ、操作部品、表示状態、アクセシビリティの追加・変更・レビュー        | [docs/ui-style-guide.md](docs/ui-style-guide.md)（デザイン判断の正本） |
| フロントエンドコンポーネントの責務・配置、Hooks、クライアント状態、データ取得の追加・変更・レビュー | [docs/frontend-architecture.md](docs/frontend-architecture.md)         |
| コードや差分のレビュー                                                                              | [docs/code-review.md](docs/code-review.md)                             |
| テストの追加・変更、変更に対応するテストの選定                                                      | [docs/testing.md](docs/testing.md)                                     |
| コード・設定・ドキュメントの変更、PRの作成・更新                                                    | [docs/workflow.md](docs/workflow.md)（完了条件を含む）                 |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
