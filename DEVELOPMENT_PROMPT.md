# かんじょうにっき - 開発継続プロンプト

## 🎯 プロジェクト概要
一般社団法人NAMIDAサポート協会が提唱するテープ式心理学に基づいた、自己肯定感を育てる感情日記アプリです。

## ⚠️ 重要な制約事項（必須遵守）
```
# Bolt への指示
- pages ディレクトリ以外は変更しないこと
- Tailwind 設定ファイルに手を加えないこと
- 新しい依存パッケージはインストールしないこと
- supabase/migrations/ 内のファイルは変更しないこと
```

## 🚀 現在の技術スタック
- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: LINE認証 + カスタム認証システム
- **デプロイ**: Netlify

## 📋 完成済み機能（2025年1月21日時点）

### ✅ ユーザー向け機能
- **感情日記システム**: 8種類のネガティブ感情の記録・分析
- **無価値感推移グラフ**: データ可視化とSNSシェア機能
- **高度な検索機能**: キーワード・日付・感情での検索
- **レスポンシブデザイン**: 全デバイス対応

### ✅ 管理者向け機能
- **カウンセラー管理画面**: 
  - 日記管理・高度検索・カレンダー検索
  - カウンセラーメモ機能
  - 担当者割り当て・緊急度管理
- **カウンセラー管理**: アカウント管理・統計表示
- **メンテナンスモード**: システム保守機能

### 🆕 新機能（最新実装）
- **自動同期システム**: ローカル↔Supabase自動同期
- **同意履歴管理**: プライバシーポリシー同意の完全追跡
- **LINE認証対応**: セキュアな認証システム（環境変数で制御）

## 🗄️ データベース構成
- **users**: ユーザー情報
- **diary_entries**: 日記エントリー
- **counselors**: カウンセラー情報
- **chat_rooms**: チャットルーム
- **messages**: メッセージ
- **consent_histories**: 同意履歴（新規追加）

## 👥 カウンセラーアカウント
| メールアドレス | パスワード |
|----------------|------------|
| jin@namisapo.com | counselor123 |
| aoi@namisapo.com | counselor123 |
| asami@namisapo.com | counselor123 |
| shu@namisapo.com | counselor123 |
| yucha@namisapo.com | counselor123 |
| sammy@namisapo.com | counselor123 |

## 🔧 環境変数設定
```env
# Supabase設定（必須）
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# LINE認証設定（オプション）
VITE_LINE_CHANNEL_ID=your_line_channel_id
VITE_LINE_CHANNEL_SECRET=your_line_channel_secret
VITE_LINE_REDIRECT_URI=your_redirect_uri

# メンテナンスモード設定（オプション）
VITE_MAINTENANCE_MODE=false
```

## 📁 重要なファイル構成

### 新規追加されたファイル
```
src/
├── hooks/
│   └── useAutoSync.ts              # 自動同期フック
├── components/
│   ├── AutoSyncSettings.tsx       # 自動同期設定UI
│   └── ConsentHistoryManagement.tsx # 同意履歴管理UI
└── lib/
    └── lineAuth.ts                 # LINE認証ライブラリ
```

### 主要な変更があったファイル
```
src/
├── App.tsx                         # 自動同期フック追加
├── lib/supabase.ts                 # 同意履歴サービス追加
├── hooks/useSupabase.ts            # 自動同期対応
├── components/
│   ├── DataMigration.tsx           # 自動同期タブ追加
│   └── PrivacyConsent.tsx          # 同意履歴記録機能追加
└── hooks/useMaintenanceStatus.ts   # パフォーマンス改善
```

## 🎯 開発時の重要なポイント

### 1. 自動同期機能
- `useAutoSync`フックが`App.tsx`で既に実装済み
- アプリ起動時に自動的にSupabaseユーザーが作成される
- 5分間隔で自動同期が実行される
- 手動での操作は基本的に不要

### 2. 同意履歴管理
- プライバシーポリシー同意時に自動的に履歴が記録される
- 管理画面から履歴を確認・CSV出力可能
- 法的要件に対応した完全な追跡システム

### 3. LINE認証
- 環境変数が設定されている場合のみ有効
- 既存のユーザー名システムと併用可能
- セキュリティ強化のためのオプション機能

## 🔄 データフロー

### 自動同期フロー
1. アプリ起動 → `useAutoSync`フック実行
2. Supabase接続確認 → ユーザー存在確認
3. ユーザー未存在の場合 → 自動作成
4. ローカルデータ存在確認 → 自動同期実行
5. 5分間隔で定期同期実行

### 同意履歴フロー
1. プライバシーポリシー表示 → ユーザー同意/拒否
2. 同意履歴をローカルストレージに記録
3. 自動同期により Supabase に同期
4. 管理画面で履歴確認・CSV出力

## 🚀 デプロイ情報
- **URL**: https://apl.namisapo2.love
- **プラットフォーム**: Netlify
- **ビルドコマンド**: `npm run build`
- **公開ディレクトリ**: `dist`

## 🔍 トラブルシューティング

### よくある問題
1. **Supabase接続エラー**: 環境変数の確認
2. **自動同期が動作しない**: ブラウザのコンソールでエラー確認
3. **カウンセラーログインできない**: パスワード`counselor123`を確認
4. **LINE認証エラー**: 環境変数とリダイレクトURIを確認

### デバッグ方法
- 開発環境では詳細なログが出力される
- `localStorage`の内容を確認
- Supabaseダッシュボードでデータ確認

## 📞 サポート情報
- **開発者**: 一般社団法人NAMIDAサポート協会
- **メール**: info@namisapo.com
- **受付時間**: 平日 9:00-17:00

---

## 🎯 開発継続時の推奨アクション

1. **環境確認**: `npm run dev`でローカル環境が正常に動作することを確認
2. **Supabase接続**: 環境変数を設定してSupabase接続を確認
3. **自動同期テスト**: 新しいユーザーでアプリを開いて自動同期をテスト
4. **機能テスト**: 日記作成、検索、管理画面の動作確認
5. **新機能開発**: 既存の制約事項を守りながら新機能を追加

このプロンプトを使用することで、プロジェクトの現在の状態を正確に把握し、効率的に開発を継続できます。