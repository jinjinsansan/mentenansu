# かんじょうにっき - 完全復元プロンプト

## 🎯 このプロンプトの使用方法
このプロンプトを新しいBoltチャットで使用することで、「かんじょうにっき」プロジェクトを完全な状態で復元できます。

---

## 📋 プロジェクト復元指示

以下の内容で「かんじょうにっき」プロジェクトを完全に復元してください：

### 🚀 基本情報
- **プロジェクト名**: かんじょうにっき（感情日記アプリ）
- **開発者**: 一般社団法人NAMIDAサポート協会
- **技術スタック**: React + TypeScript + Vite + Tailwind CSS + Supabase
- **最終更新**: 2025年1月21日
- **デプロイURL**: https://apl.namisapo2.love

### ⚠️ 重要な制約事項（必須遵守）
```
# Bolt への指示
- pages ディレクトリ以外は変更しないこと
- Tailwind 設定ファイルに手を加えないこと
- 新しい依存パッケージはインストールしないこと
- supabase/migrations/ 内のファイルは変更しないこと
```

### 📦 必要な依存関係
```json
{
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

### 🔧 環境変数設定
`.env.example`ファイルを作成し、以下の内容を設定：
```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google認証設定
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=your_redirect_uri
```

## 🌟 実装済み機能一覧

### ✅ ユーザー向け機能
1. **感情日記システム**
   - 8種類のネガティブ感情（恐怖、悲しみ、怒り、悔しい、無価値感、罪悪感、寂しさ、恥ずかしさ）
   - 出来事と気づきの記録
   - 無価値感選択時の自己肯定感・無価値感スコア入力
   - 日記の作成・編集・削除機能

2. **無価値感推移グラフ**
   - 自己肯定感と無価値感の推移をグラフで可視化
   - 期間フィルター（1週間・1ヶ月・全期間）
   - SNSシェア機能
   - 感情の出現頻度表示

3. **高度な検索機能**
   - キーワード検索（出来事・気づき）
   - 感情別フィルター
   - 日付範囲検索
   - 直近5日分の日記表示

4. **レスポンシブデザイン**
   - 全デバイス対応（PC・タブレット・スマートフォン）
   - 日本語フォント最適化（Noto Sans JP）

### ✅ 管理者向け機能
1. **カウンセラー管理画面**
   - 日記一覧・詳細表示
   - 高度な検索・フィルター機能
   - カレンダー検索機能
   - カウンセラーメモ機能
   - 担当者割り当て機能
   - 緊急度管理（高・中・低）
   - 統計ダッシュボード

2. **カウンセラー管理**
   - カウンセラーアカウント管理
   - 担当案件表示
   - 統計情報表示

3. **メンテナンスモード**
   - システム保守時の適切な案内
   - 進捗表示機能
   - 環境変数による制御

### 🆕 新機能（2025年1月21日実装）
1. **自動同期システム**
   - アプリ起動時の自動ユーザー作成・確認
   - 5分間隔でのローカルデータ自動同期
   - 手動同期オプション
   - エラーハンドリングと状態表示

2. **同意履歴管理**
   - プライバシーポリシー同意の完全追跡
   - 法的要件に対応した履歴保存
   - CSV出力機能
   - 管理画面での一覧・検索機能

3. **Google認証対応**
   - セキュアなOAuth2.0認証（PKCE対応）
   - CSRF・リプレイ攻撃対策
   - トークン管理とリフレッシュ
   - 既存システムとの互換性維持

## 🗄️ データベース構成

### Supabaseテーブル
1. **users**: ユーザー情報
   - id (uuid, primary key)
   - line_username (text, unique)
   - created_at (timestamp)

2. **diary_entries**: 日記エントリー
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - date (date)
   - emotion (text)
   - event (text)
   - realization (text)
   - self_esteem_score (integer)
   - worthlessness_score (integer)
   - created_at (timestamp)

3. **counselors**: カウンセラー情報
   - id (uuid, primary key)
   - name (text)
   - email (text, unique)
   - is_active (boolean)
   - created_at (timestamp)

4. **chat_rooms**: チャットルーム
   - id (uuid, primary key)
   - user_id (uuid, foreign key)
   - counselor_id (uuid, foreign key)
   - status (text)
   - created_at (timestamp)

5. **messages**: メッセージ
   - id (uuid, primary key)
   - chat_room_id (uuid, foreign key)
   - sender_id (uuid, foreign key)
   - counselor_id (uuid, foreign key)
   - content (text)
   - is_counselor (boolean)
   - created_at (timestamp)

6. **consent_histories**: 同意履歴（新規追加）
   - id (uuid, primary key)
   - line_username (text)
   - consent_given (boolean)
   - consent_date (timestamp)
   - ip_address (text)
   - user_agent (text)
   - created_at (timestamp)

### データベースマイグレーション
`supabase/migrations/20250621151756_delicate_limit.sql`ファイルが存在し、すべてのテーブル作成とRLS設定が含まれています。

## 👥 カウンセラーアカウント
以下のアカウントでカウンセラーログインが可能：

| 名前 | メールアドレス | パスワード |
|------|----------------|------------|
| 仁カウンセラー | jin@namisapo.com | counselor123 |
| AOIカウンセラー | aoi@namisapo.com | counselor123 |
| あさみカウンセラー | asami@namisapo.com | counselor123 |
| SHUカウンセラー | shu@namisapo.com | counselor123 |
| ゆーちゃカウンセラー | yucha@namisapo.com | counselor123 |
| sammyカウンセラー | sammy@namisapo.com | counselor123 |

## 📁 重要なファイル構成

### 新規追加されたファイル（2025年1月21日）
```
src/
├── hooks/
│   └── useAutoSync.ts              # 自動同期フック
├── components/
│   ├── AutoSyncSettings.tsx       # 自動同期設定UI
│   ├── ConsentHistoryManagement.tsx # 同意履歴管理UI
│   ├── GoogleAuthGuard.tsx        # Google認証ガード
│   └── GoogleAuthCallback.tsx     # Google認証コールバック
├── lib/
│   └── googleAuth.ts              # Google認証ライブラリ
└── pages/
    ├── GoogleLogin.tsx            # Googleログインページ
    └── GoogleAuthCallback.tsx     # Google認証コールバックページ
```

### 主要な変更があったファイル
```
src/
├── App.tsx                         # Google認証対応、自動同期フック追加
├── lib/supabase.ts                 # 同意履歴サービス追加、本番環境対応
├── hooks/useSupabase.ts            # 自動同期対応
├── components/
│   ├── DataMigration.tsx           # 自動同期タブ追加、統計表示
│   ├── PrivacyConsent.tsx          # 同意履歴記録機能追加
│   └── AdminPanel.tsx              # UI改善
├── hooks/useMaintenanceStatus.ts   # パフォーマンス改善
└── netlify.toml                    # Google認証コールバック対応
```

## 🎯 重要な実装ポイント

### 1. 自動同期システム
- `useAutoSync`フックが`App.tsx`で実装済み
- アプリ起動時に自動的にSupabaseユーザーが作成される
- 5分間隔で自動同期が実行される
- 手動での操作は基本的に不要

### 2. 同意履歴管理
- プライバシーポリシー同意時に自動的に履歴が記録される
- 管理画面の「カウンセラー」タブから履歴を確認可能
- CSV出力機能で法的要件に対応

### 3. Google認証
- 環境変数が設定されている場合のみ有効
- PKCE対応のセキュアな認証フロー
- 既存のユーザー名システムと併用可能
- セキュリティ強化のためのオプション機能

### 4. データフロー
```
アプリ起動 → Google認証チェック → useAutoSync実行 → Supabase接続確認 
→ ユーザー存在確認 → ユーザー未存在の場合は自動作成 → ローカルデータ確認 
→ 自動同期実行 → 5分間隔で定期同期実行
```

## 🚀 デプロイ設定

### Netlify設定
- **ビルドコマンド**: `npm run build`
- **公開ディレクトリ**: `dist`
- **リダイレクト**: `netlify.toml`で設定済み

### 必要なファイル
```
netlify.toml:
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Google認証コールバック用のリダイレクト設定
[[redirects]]
  from = "/auth/google/callback"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 🔍 テストデータ
アプリには20日分のテストデータが自動生成される機能が実装されています。初回起動時に自動的に生成されます。

## 📞 サポート情報
- **開発者**: 一般社団法人NAMIDAサポート協会
- **メール**: info@namisapo.com
- **受付時間**: 平日 9:00-17:00

---

## 🎯 復元後の確認事項

1. **環境確認**: `npm run dev`でローカル環境が正常に動作することを確認
2. **Supabase接続**: 環境変数を設定してSupabase接続を確認
3. **自動同期テスト**: 新しいユーザーでアプリを開いて自動同期をテスト
4. **機能テスト**: 日記作成、検索、管理画面の動作確認
5. **カウンセラーログイン**: 管理画面へのアクセス確認
6. **Google認証テスト**: 環境変数設定後のGoogle認証動作確認

## 🔧 Google認証設定（オプション）

Google認証を有効にする場合は、以下の手順で設定してください：

1. **Google Cloud Console**でプロジェクトを作成
2. **OAuth 2.0クライアントID**を作成
3. **承認済みのリダイレクトURI**に以下を追加：
   - 開発環境: `http://localhost:5173/auth/google/callback`
   - 本番環境: `https://apl.namisapo2.love/auth/google/callback`
4. **環境変数**に設定：
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_REDIRECT_URI=your_redirect_uri
   ```

このプロンプトを使用することで、完全な状態でプロジェクトを復元し、すべての機能が正常に動作する状態にできます。