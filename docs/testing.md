# テスト

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

Firebase Emulator のテスト設定は次の環境変数で上書きできる。未指定時は `src/shared/lib/env.ts` のテスト用デフォルト値を使う。

- `TEST_FIREBASE_PROJECT_ID`
- `TEST_FIREBASE_API_KEY`
- `TEST_FIREBASE_AUTH_DOMAIN`
- `TEST_FIREBASE_STORAGE_BUCKET`
- `TEST_FIREBASE_APP_ID`
