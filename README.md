# ダイススペック

![](/public/ogp.png)

## 概要

### どういうアプリ？

TRPGのちょっとしたツールをまとめたようなアプリです。現在は以下のような機能を備えています。

- **ダイス予測**
  - ダイスの期待値や確率を計算します
- **ダイスロール**
  - シンプルなダイスロールおよびBCDiceを使ったダイスロールができます
- **ログ解析**
  - ココフォリアのルームログからダイスの出目を解析します (クトゥルフ神話TRPG 6版・7版 二のみ対応)
- **ココフォリア出力**
  - ココフォリアのキャラ出力形式をビジュアルで編集できます

機能追加のリクエストは[サポート用のDiscordサーバー](https://discord.gg/YQ7negGTUK)までお願いします。

### 技術スタック

#### アプリケーション用

- [Next.js v13 (App Router)](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/) (UIコンポーネント)
  - [Radix UI](https://radix-ui.com/)
- [Tabler Icons](https://tabler-icons.io/) (アイコン)
- [Jotai](https://jotai.org/) (状態管理)
- [Tailwind CSS](https://tailwindcss.com/) (スタイリング)
- [Valibot](https://valibot.dev/) (型バリデーション)

#### 開発者用

- [Vitest](https://vitest.dev/)
- [ESlint](https://eslint.org/)
- [Stylelint](https://stylelint.io/)
- [Prettier](https://prettier.io/)

## 環境セットアップ

### 事前準備

[nodenv](https://github.com/nodenv/nodenv) なり [asdf](https://asdf-vm.com/) なり [n](https://github.com/tj/n) なりを使って `.node-version` にあるNode.jsのバージョンをインストールしてください。 (たぶんv18とかでも動くけどね)

`npm i -g corepack` で [Corepack](https://github.com/nodejs/corepack) をインストールしてください

### セットアップ

まず、下のコマンドのどちらかでリポジトリをクローンしてください。

```sh
git clone https://github.com/cp-20/dice-spec-v2
```

```sh
git clone git@github.com:cp-20/dice-spec-v2.git
```

次に下のコマンドで依存関係をインストールしてください。

```sh
pnpm i
```

正しくインストールができれば、次のコマンドで開発サーバーが起動します。

```sh
pnpm dev
```

デフォルトで `localhost:3000` にサーバーが立ちます。ブラウザで正しく表示されれば成功です。

他のコマンドは `package.json` を参照してください。

## リポジトリの設計

### ディレクトリ構成

```
.
├── public -> 静的ファイル
└── src
    ├── app
    │   ├── (app)
    │   │   ├── _components -> アプリで使われる共通コンポーネント
    │   │   ├── analyze-logs -> ログ解析のページ
    │   │   ├── ccfolia -> ココフォリア出力のページ
    │   │   ├── dice -> ダイスロールのページ
    │   │   └── expect -> ダイス予測のページ
    │   └── (landing-page) -> ランディングページ
    ├── shared -> アプリケーション全体で使われる共通コード
    │   ├── components -> 共通コンポーネント
    │   │   ├── Layout -> レイアウトコンポーネント (e.g. Header, Footer)
    │   │   ├── Typography -> テキストコンポーネント (e.g. H1, Text)
    │   │   ├── elements -> 自作の共通コンポーネント
    │   │   └── ui -> shadcn/uiのコンポーネント
    │   ├── fonts -> フォント
    │   ├── lib -> ロジック系のコード
    │   └── styles -> 共通スタイル
    └── test -> テストで使われるコード
```

基本的には `./_components` 以下のコンポーネントを使いながらページを作っていきます。長いロジックは`./_components/hooks`以下に切り出すと良いです。

### ブランチ命名規則

`issue-<issue番号>` という名前のブランチを切ってください。例えば、issue番号が `1` の場合は `issue-1` という名前のブランチを切ってください。
