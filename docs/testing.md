# テスト

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
bun test --path-ignore-patterns='firebase/*.rules.test.ts'
bun test firebase/*.rules.test.ts
```

Firebase Emulator の環境変数とデフォルト値は [src/shared/lib/env.ts](../src/shared/lib/env.ts) を参照する。
