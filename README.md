# かんじょうにっき - 感情日記アプリ

一般社団法人NAMIDAサポート協会が提唱するテープ式心理学に基づいた、自己肯定感を育てる感情日記アプリです。

## 🌟 主な機能

### ユーザー向け機能
- **感情日記**: 8種類のネガティブ感情を記録・分析
- **無価値感推移**: グラフによる自己肯定感の可視化
- **日記検索**: キーワード・日付・感情での高度な検索
- **SNSシェア**: 成長の記録をシェア
- **レスポンシブデザイン**: 全デバイス対応

### 管理者向け機能
- **管理画面**: カウンセラー専用の統合管理システム
- **カレンダー検索**: 視覚的な日付検索機能
- **カウンセラーメモ**: 各日記への専門的なメモ機能
- **担当者管理**: ワンクリックでの担当者割り当て
- **緊急度管理**: 3段階の緊急度設定・監視
- **データ管理**: Supabaseとの連携・同期機能

### 新機能（2025年1月21日実装）
- **EmailJS統合**: 確認コードのメール送信機能
- **自動同期機能**: ローカルデータの自動Supabase同期
- **同意履歴管理**: プライバシーポリシー同意の完全追跡
- **メンテナンスモード**: システム保守時の適切な案内

## 🚀 技術スタック

- **フロントエンド**: React + TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: カスタム認証システム
- **デプロイ**: Netlify
- **開発環境**: Vite

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/kanjou-nikki.git
cd kanjou-nikki

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してSupabaseの設定を追加

# 開発サーバーを起動
npm run dev
```

### 環境変数

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS設定
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

## 🗄️ データベース設定

### Supabaseセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/migrations/20250621151756_delicate_limit.sql`を実行
3. 環境変数を設定

### テーブル構成

- **users**: ユーザー情報
- **diary_entries**: 日記エントリー
- **counselors**: カウンセラー情報
- **chat_rooms**: チャットルーム
- **messages**: メッセージ
- **consent_histories**: 同意履歴

## 📧 EmailJS設定手順

### 1. EmailJSアカウント作成
1. [EmailJS](https://www.emailjs.com/)にアクセスし、無料アカウントを作成
2. ダッシュボードにログイン

### 2. メールサービス設定
1. 「Email Services」タブを選択
2. 「Add New Service」をクリック
3. Gmail、Outlook、カスタムSMTPなどからサービスを選択
4. 指示に従って認証情報を入力
5. 作成されたService IDをメモ

### 3. メールテンプレート作成
1. 「Email Templates」タブを選択
2. 「Create New Template」をクリック
3. テンプレート名を入力（例：「Verification Code」）
4. 以下のパラメータを使用してテンプレートを作成:
   - `{{to_email}}`: 送信先メールアドレス
   - `{{verification_code}}`: 確認コード
   - `{{app_name}}`: アプリ名
   - `{{user_name}}`: ユーザー名
5. 作成されたTemplate IDをメモ

### 4. 環境変数設定
`.env`ファイルに以下の環境変数を追加:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 5. 動作確認
1. アプリを起動
2. ハイブリッド認証設定画面でテスト送信を実行
3. 指定したメールアドレスに確認コードが届くことを確認

### 注意事項
- 無料プランでは月300通までメール送信可能
- テンプレートには必ず`{{verification_code}}`パラメータを含めること
- 本番環境では環境変数を適切に設定すること

## 👥 カウンセラーアカウント

管理画面にアクセスするためのカウンセラーアカウント：

| 名前 | メールアドレス |
|------|----------------|
| 仁カウンセラー | jin@namisapo.com |
| AOIカウンセラー | aoi@namisapo.com |
| あさみカウンセラー | asami@namisapo.com |
| SHUカウンセラー | shu@namisapo.com |
| ゆーちゃカウンセラー | yucha@namisapo.com |
| sammyカウンセラー | sammy@namisapo.com |

**共通パスワード**: `counselor123`

## 🎯 使用方法

### ユーザー向け

1. **初回利用**: プライバシーポリシーに同意
2. **ユーザー名設定**: LINEユーザー名を入力
3. **初期測定**: 自己肯定感スコアアプリで測定
4. **日記作成**: 感情と出来事を記録
5. **推移確認**: グラフで成長を可視化

### カウンセラー向け

1. **ログイン**: カウンセラー専用アカウントでログイン
2. **日記確認**: ユーザーの日記を一覧表示
3. **検索・フィルター**: 条件を指定して日記を検索
4. **担当者割り当て**: 適切なカウンセラーを割り当て
5. **緊急度設定**: 必要に応じて緊急度を設定
6. **メモ追加**: 専門的な観点からメモを追加

## 📊 主要機能詳細

### 感情日記機能
- 8種類のネガティブ感情を選択
- 出来事と気づきを記録
- 無価値感選択時は自己肯定感スコアも記録

### 管理画面機能
- **高度な検索**: キーワード、感情、緊急度、担当者、日付での検索
- **カレンダー検索**: 視覚的なカレンダーで日付を選択
- **統計ダッシュボード**: リアルタイムの統計情報
- **カウンセラーメモ**: 各日記への専門的なコメント機能

### データ管理機能
- ローカルストレージとSupabaseの双方向同期
- データの移行・バックアップ機能
- 接続状態の監視

### 自動同期機能（新機能）
- アプリ起動時の自動ユーザー作成・確認
- 5分間隔でのローカルデータ自動同期
- 手動同期オプション
- エラーハンドリングと状態表示

### 同意履歴管理（新機能）
- プライバシーポリシー同意の完全追跡
- 法的要件に対応した履歴保存
- CSV出力機能
- 管理画面での一覧・検索機能

## 🔒 セキュリティ

- Row Level Security (RLS) による適切なデータアクセス制御
- カウンセラー専用認証システム
- ユーザーデータの適切な保護

## 🎨 デザイン原則

- **ユーザビリティ重視**: 直感的で使いやすいインターフェース
- **アクセシビリティ**: 色覚に配慮した設計
- **レスポンシブ**: 全デバイスで最適な表示
- **一貫性**: 統一されたデザインシステム

## 📱 対応環境

- **ブラウザ**: Chrome, Firefox, Safari, Edge (最新版)
- **デバイス**: デスクトップ, タブレット, スマートフォン
- **OS**: Windows, macOS, iOS, Android

## 🚀 デプロイ

### Netlifyデプロイ

```bash
# ビルド
npm run build

# Netlifyにデプロイ
# dist フォルダをアップロード
```

### 環境変数設定

Netlifyの環境変数に以下を設定：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは一般社団法人NAMIDAサポート協会の所有物です。

## 📞 サポート

- **メール**: info@namisapo.com
- **受付時間**: 平日 9:00-17:00

## 🏗️ 開発者向け情報

### プロジェクト構造

```
src/
├── components/          # 共通コンポーネント
│   ├── AdminPanel.tsx   # 管理画面
│   ├── AutoSyncSettings.tsx # 自動同期設定
│   ├── ConsentHistoryManagement.tsx # 同意履歴管理
│   └── ...
├── pages/               # ページコンポーネント
│   ├── DiaryPage.tsx    # 日記作成
│   ├── DiarySearchPage.tsx # 日記検索
│   └── ...
├── lib/                 # ライブラリ
│   └── supabase.ts      # Supabase設定
├── hooks/               # カスタムフック
│   ├── useSupabase.ts   # Supabase連携
│   ├── useAutoSync.ts   # 自動同期
│   └── useMaintenanceStatus.ts # メンテナンス状態
└── ...
```

### 重要な制約

- `pages` ディレクトリ以外は変更しないこと
- Tailwind設定ファイルに手を加えないこと
- 新しい依存パッケージはインストールしないこと

### テストデータ

開発環境では20日分のテストデータが自動生成されます。
本番環境では実際のユーザーデータが使用されます。

---

**一般社団法人NAMIDAサポート協会**  
テープ式心理学による心の健康サポート