/*
  # カウンセラーコメント機能追加

  1. 新しいテーブル
    - `counselor_comments` - カウンセラーコメント
      - `id` (uuid, primary key)
      - `diary_entry_id` (uuid, foreign key to diary_entries)
      - `counselor_id` (uuid, foreign key to counselors)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分の日記に対するコメントのみ読み取り可能
    - カウンセラーは全てのコメントを読み書き可能
*/

-- カウンセラーコメントテーブル
CREATE TABLE IF NOT EXISTS counselor_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id uuid REFERENCES diary_entries(id) ON DELETE CASCADE,
  counselor_id uuid REFERENCES counselors(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_counselor_comments_diary_entry_id ON counselor_comments(diary_entry_id);
CREATE INDEX IF NOT EXISTS idx_counselor_comments_counselor_id ON counselor_comments(counselor_id);
CREATE INDEX IF NOT EXISTS idx_counselor_comments_created_at ON counselor_comments(created_at);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_counselor_comments_updated_at 
    BEFORE UPDATE ON counselor_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS有効化
ALTER TABLE counselor_comments ENABLE ROW LEVEL SECURITY;

-- RLSポリシー設定

-- ユーザーは自分の日記に対するコメントのみ読み取り可能
CREATE POLICY "Users can read comments on own diary entries"
  ON counselor_comments
  FOR SELECT
  TO authenticated
  USING (
    diary_entry_id IN (
      SELECT id FROM diary_entries 
      WHERE user_id IN (SELECT id FROM users WHERE line_username = auth.uid()::text)
    )
  );

-- カウンセラーは全てのコメントを読み書き可能
CREATE POLICY "Counselors can manage all comments"
  ON counselor_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors 
      WHERE id = counselor_id AND email = auth.email() AND is_active = true
    )
  );

-- カウンセラーは新しいコメントを作成可能
CREATE POLICY "Counselors can create comments"
  ON counselor_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM counselors 
      WHERE id = counselor_id AND email = auth.email() AND is_active = true
    )
  );