# テスト

## 方針

- コード内の依存は実装をつなぎ、公開された操作から状態・出力までを検証するインテグレーションテストを基本とする。内部関数の呼び出し回数や引数だけを検証するためにモックを作らない。
- Firebase などの外部依存はエミュレータに接続し、実際の SDK、認証、永続化、Security Rules を通す。エミュレータがないサービスは提供元のサンドボックスやテスト環境を使い、本番データや実課金には接続しない。
- 純粋な計算・パーサーの単体テストは残してよい。テストを結合するだけのために無関係な処理を組み合わせない。
- モックは実環境で安定して再現できない通信障害・競合の順序制御・乱数の固定、DOM環境にないブラウザ機能、外部サービスのテスト環境で再現できない応答、検証対象外のテレメトリ送信に限定し、理由をテストに記す。置き換える範囲は外部境界に寄せ、正常系をモックだけで保証しない。
- 既存テストを変更する際は、モックの検証を実際の結果の検証へ置き換える。障害や競合の回帰テストは、同じ条件を検証できる移行先ができるまで削除しない。

## インテグレーションテスト

外部サービスを必要としないテストは `pnpm test`、Firebase に接続する `*.emulator.test.ts` は `pnpm test:integration` で実行する。後者は Java 21 以上が必要で、Firebase CLI が Auth・Firestore Emulator の起動と終了を管理する。CI でも実行する。接続先は [firebase/firebase-integration.json](../firebase/firebase-integration.json) を正本とし、E2E・Rules 用とは別のポートを使う。データ初期化が競合しないよう、テストファイルは直列に実行する。

テストは専用の demo プロジェクトを使い、認証ユーザーとデータをテストごとに分離し、終了時に破棄する。初期データの投入だけ Rules を無効化してよいが、検証対象の操作はアプリの実装と Rules を通す。エミュレータが起動できない場合は失敗させ、スキップやモックへ自動的に切り替えない。

## E2E テスト

- アプリの主要な利用経路を押さえ、一つの機能の正常系だけで網羅したと判断しない。ユーザー操作から結果の確認までを通し、機能間の遷移や保存後の再読み込みなど、利用上重要な状態遷移も検証する。
- 変更時は、影響する利用経路を既存のE2Eと照合して不足を補う。

## テストデータ

外部 URL やメールアドレスには、実在する宛先への通信を避けるため `dicespec.test` またはそのサブドメインを使う。ローカルサービスとの接続には `localhost`、`127.0.0.1`、`::1` を使ってよい。

## Firebase Rules テスト

Firebase Emulator を使う Rules テストは、次のファイルが変更された場合に実行する。

- `firebase/*.rules`
- `firebase/*.rules.test.ts`
- `firebase/test/**`
- `firebase/firebase.json`
- `src/shared/lib/env.ts` のテスト用 Firebase 設定

アプリケーション実装や通常の単体テストだけを変更した場合は再実行しない。通常のテストと Rules テストは次のコマンドで分けて実行する。

```sh
pnpm test
pnpm test:firebase
```

Firebase Emulator の環境変数とデフォルト値は [src/shared/lib/env.ts](../src/shared/lib/env.ts) を参照する。

## Stripe E2E

`STRIPE_E2E_SECRET_KEY` に専用 Stripe Sandbox のテストキーを設定して `pnpm test:e2e:stripe` を実行する。Java 21 以上と Stripe CLI が必要。Firebase Emulator・Stripe CLI の Webhook 転送・Workers の本番ビルドを起動し、実際の Sandbox 契約作成と解約から Firestore 更新、ブラウザ表示、再読み込み後の状態まで検証する。署名の欠落・不正な署名による契約状態の変更も拒否されることを確認する。

通常の E2E と接続ポートを分け、設定は [firebase/firebase-stripe-e2e.json](../firebase/firebase-stripe-e2e.json) を正本とする。実行ごとに顧客・商品・価格を作り、終了時に顧客と契約を削除して商品と価格をアーカイブする。本番キーは拒否し、接続障害や認証切れはテストを失敗させる。試用期間内に解約するため、決済完了画面や有料請求の成功までは検証しない。

Sandbox キーはローカルの環境変数で渡し、リポジトリや Playwright の成果物に保存しない。CLI 認証で発行された期限付きキーを使う場合は期限前に更新する。

Stripe E2E は同じリポジトリ内の PR・main への push・手動起動で CI 実行する。fork 由来の PR はジョブ条件で除外し、Sandbox キーを渡さない。キーはリポジトリ Secret `STRIPE_E2E_SECRET_KEY` に登録する。
