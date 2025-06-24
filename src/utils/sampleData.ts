// サンプルデータ生成ユーティリティ

// サンプルカウンセラーコメントを生成
export const generateSampleCounselorComments = (diaryEntries: any[]) => {
  if (!diaryEntries || diaryEntries.length === 0) return [];
  
  const counselors = [
    { id: '1', name: '仁カウンセラー', email: 'jin@namisapo.com' },
    { id: '2', name: 'AOIカウンセラー', email: 'aoi@namisapo.com' },
    { id: '3', name: 'あさみカウンセラー', email: 'asami@namisapo.com' },
    { id: '4', name: 'SHUカウンセラー', email: 'shu@namisapo.com' },
    { id: '5', name: 'ゆーちゃカウンセラー', email: 'yucha@namisapo.com' },
    { id: '6', name: 'sammyカウンセラー', email: 'sammy@namisapo.com' }
  ];
  
  const comments = [
    '素晴らしい気づきですね。感情に向き合う姿勢が成長につながります。',
    '無価値感に気づけたことは大きな一歩です。自分を責めすぎないでくださいね。',
    'この出来事からどんな学びがありましたか？次回話し合えると良いですね。',
    '感情を言語化できていて素晴らしいです。これからも続けていきましょう。',
    '怒りの感情に気づけたのは素晴らしいことです。感情を認めることが大切ですね。',
    '自己肯定感が少しずつ上がっていますね。小さな変化を大切にしましょう。',
    '悲しみを感じることも大切な心の働きです。しっかり向き合えていますね。',
    '寂しさを認識できていることは素晴らしいです。感情に名前をつけられていますね。',
    '恐怖に向き合う勇気を持てていますね。一緒に乗り越えていきましょう。',
    '日記を続けることで感情の変化に気づけるようになりますよ。頑張りましょう。'
  ];
  
  // 日記エントリーの約30%にコメントを付ける
  const commentedEntries = diaryEntries
    .sort(() => Math.random() - 0.5) // ランダムに並び替え
    .slice(0, Math.ceil(diaryEntries.length * 0.3)); // 30%を選択
  
  const sampleComments = [];
  
  for (const entry of commentedEntries) {
    // ランダムなカウンセラーを選択
    const counselor = counselors[Math.floor(Math.random() * counselors.length)];
    
    // ランダムなコメントを選択
    const comment = comments[Math.floor(Math.random() * comments.length)];
    
    // コメント作成日時（日記作成の1-3日後）
    const entryDate = new Date(entry.date);
    const commentDate = new Date(entryDate);
    commentDate.setDate(commentDate.getDate() + Math.floor(Math.random() * 3) + 1);
    
    sampleComments.push({
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      diary_entry_id: entry.id,
      counselor_id: counselor.id,
      comment,
      created_at: commentDate.toISOString(),
      updated_at: commentDate.toISOString(),
      counselor: {
        name: counselor.name,
        email: counselor.email
      }
    });
  }
  
  return sampleComments;
};

// サンプルデータをローカルストレージに保存
export const saveSampleCounselorComments = () => {
  // 既存のコメントがあれば何もしない
  const existingComments = localStorage.getItem('counselorComments');
  if (existingComments) return;
  
  // 日記エントリーを取得
  const savedEntries = localStorage.getItem('journalEntries');
  if (!savedEntries) return;
  
  const entries = JSON.parse(savedEntries);
  const sampleComments = generateSampleCounselorComments(entries);
  
  // ローカルストレージに保存
  localStorage.setItem('counselorComments', JSON.stringify(sampleComments));
  
  console.log(`${sampleComments.length}件のサンプルカウンセラーコメントを作成しました`);
};