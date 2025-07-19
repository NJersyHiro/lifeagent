# LifeAgent

自然言語からカレンダーイベントやToDoを自動的に解析して登録するWebアプリケーション。

## 機能

- 自然言語テキストの解析（例：「来週火曜日13時に歯医者」）
- イベントとToDoの自動分類
- Googleカレンダーとの連携
- OpenAI GPTを使用した高精度な日時解析

## 技術スタック

- Next.js 14（App Router）
- TypeScript
- NextAuth.js（Google OAuth）
- OpenAI API
- Google Calendar API
- Tailwind CSS

## セットアップ

1. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

2. 依存関係のインストール

```bash
npm install
```

3. 開発サーバーの起動

```bash
npm run dev
```

## 使い方

1. ブラウザで`http://localhost:3000`にアクセス
2. テキストボックスに予定やToDoを自然言語で入力
3. 「解析する」ボタンをクリック
4. 解析結果が表示され、イベントの場合は自動的にGoogleカレンダーに登録

## API エンドポイント

- `POST /api/parse` - テキストを解析してイベント/ToDoに分類
- `POST /api/calendar/add` - Googleカレンダーにイベントを追加
- `/api/auth/[...nextauth]` - 認証処理（Google OAuth）

## 型定義

NextAuth.jsのセッション型を拡張してaccess_tokenを含めるよう設定済み（`types/next-auth.d.ts`）。