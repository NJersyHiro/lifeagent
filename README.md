# LifeAgent

パーソナル生産性アシスタント - 自然言語処理を使用してカレンダーイベントやToDoを自動作成し、Gmail監視・自動返信、支出管理機能を提供するフルスタックWebアプリケーション。

## 主な機能

### 📅 スマートスケジューリング
- 自然言語テキストの解析（例：「来週火曜日13時に歯医者」）
- イベントとToDoの自動分類
- Googleカレンダーとの連携
- OpenAI GPTを使用した高精度な日時解析

### 📧 Gmail統合
- 自動メール監視（サーバー側での定期実行）
- AI生成による自動返信下書き作成
- リアルタイムメール通知
- メールスレッド管理

### 💰 支出管理
- レシート画像のOCR自動解析（Google Cloud Vision API）
- 支出データの記録と管理
- CSV形式でのエクスポート機能
- カテゴリ別支出分析

### 🔐 セキュアな認証
- Google OAuthによる安全な認証
- 自動トークンリフレッシュ機能
- セッション管理の最適化

## 技術スタック

### フロントエンド
- **Next.js 15** - App Router搭載の最新版
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストのCSS
- **PWA対応** - オフラインサポート付きプログレッシブWebアプリ

### バックエンド
- **Next.js API Routes** - サーバーレスAPI
- **Prisma ORM** - 型安全なデータベースアクセス
- **SQLite** - 軽量なローカルデータベース

### 外部サービス連携
- **NextAuth.js** - Google OAuth認証
- **OpenAI API** - 自然言語処理とAI機能
- **Google Calendar API** - カレンダーイベント管理
- **Gmail API** - メール監視と自動化
- **Google Cloud Vision API** - OCRレシート解析

### 自動化
- **Vercel Cron Jobs** - サーバー側の定期実行タスク
- **Service Worker** - オフライン機能とPWAサポート

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/NJersyHiro/lifeagent.git
cd lifeagent
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Google OAuth & APIs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL="file:./dev.db"

# Google Cloud Vision API (オプション - OCR機能用)
GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. データベースのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベーススキーマの適用
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 使い方

### 初回セットアップ
1. ブラウザで`http://localhost:3000`にアクセス
2. 「Sign in with Google」ボタンをクリックしてGoogleアカウントでログイン
3. 必要な権限（カレンダー、Gmail）を許可

### 機能の使用方法

#### 📅 スケジュール管理
1. テキストボックスに予定やToDoを自然言語で入力
   - 例：「来週火曜日13時に歯医者」
   - 例：「明日までにレポートを提出」
2. 「解析する」ボタンをクリック
3. 解析結果が表示され、イベントは自動的にGoogleカレンダーに登録

#### 📧 Gmail監視
1. Gmail監視機能は自動的に有効化されます
2. サーバーが1時間ごとに新着メールをチェック
3. 重要なメールには自動返信の下書きが生成されます
4. 「Gmail監視」セクションで監視状態を確認可能

#### 💰 支出管理
1. 「支出管理」タブをクリック
2. レシート画像をアップロードするか、手動で支出を入力
3. OCRが自動的にレシート内容を解析
4. 支出履歴はCSV形式でエクスポート可能

## API エンドポイント

### 認証
- `/api/auth/[...nextauth]` - NextAuth.js認証エンドポイント

### カレンダー & Todo
- `POST /api/parse` - テキストを解析してイベント/ToDoに分類
- `POST /api/calendar/add` - Googleカレンダーにイベントを追加
- `GET /api/todo` - Todoリストの取得
- `POST /api/todo` - 新規Todo作成
- `PUT /api/todo/[id]` - Todo更新
- `DELETE /api/todo/[id]` - Todo削除

### Gmail
- `GET /api/gmail/fetch` - 新着メールの取得
- `POST /api/gmail/init` - Gmail監視の初期化
- `GET /api/gmail/status` - 監視状態の取得
- `GET /api/emails` - 保存済みメール一覧
- `POST /api/emails/send` - メール送信
- `POST /api/emails/draft` - 下書き作成

### 支出管理
- `GET /api/expense` - 支出一覧の取得
- `POST /api/expense` - 新規支出の記録
- `PUT /api/expense/[id]` - 支出情報の更新
- `DELETE /api/expense/[id]` - 支出記録の削除
- `GET /api/expense/export` - CSV形式でエクスポート
- `POST /api/ocr` - レシート画像のOCR解析

## プロジェクト構造

```
lifeagent/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   │   ├── auth/         # 認証関連
│   │   ├── calendar/     # カレンダー連携
│   │   ├── emails/       # メール管理
│   │   ├── expense/      # 支出管理
│   │   ├── gmail/        # Gmail監視
│   │   ├── ocr/          # OCR処理
│   │   ├── parse/        # 自然言語解析
│   │   └── todo/         # Todo管理
│   ├── components/        # Reactコンポーネント
│   └── page.tsx          # ホームページ
├── lib/                   # ユーティリティ
│   ├── auth.ts           # 認証設定
│   └── prisma.ts         # データベース接続
├── prisma/               # データベース設定
│   └── schema.prisma     # スキーマ定義
├── public/               # 静的ファイル
├── types/                # TypeScript型定義
└── instrumentation.ts    # Vercel Cron設定
```

## 開発ガイド

### データベーススキーマの変更

```bash
# スキーマ変更後
npx prisma generate
npx prisma db push

# マイグレーションの作成（本番環境向け）
npx prisma migrate dev --name your_migration_name
```

### デバッグ

```bash
# Prisma Studioでデータベースを確認
npx prisma studio

# ログの確認（開発環境）
npm run dev
```

## デプロイ（Vercel）

1. Vercelにプロジェクトをインポート
2. 環境変数を設定
3. Cron Jobsの設定（`vercel.json`で定義済み）

## トラブルシューティング

### Gmail認証エラー
`README_AUTH_FIX.md`ファイルを参照してください。

### トークンリフレッシュエラー
- Google OAuthのリフレッシュトークンが失効している可能性があります
- ユーザーに再認証を促してください

### OCR機能が動作しない
- Google Cloud Vision APIキーが正しく設定されているか確認
- APIの使用制限に達していないか確認

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。