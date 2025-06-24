import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Share2, Filter, Download } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  selfEsteemScore: number;
  worthlessnessScore: number;
}

const EmotionChart: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const emotions = [
    { name: '恐怖', color: '#8B5CF6', bgColor: 'bg-purple-500' },
    { name: '悲しみ', color: '#3B82F6', bgColor: 'bg-blue-500' },
    { name: '怒り', color: '#EF4444', bgColor: 'bg-red-500' },
    { name: '悔しい', color: '#10B981', bgColor: 'bg-green-500' },
    { name: '無価値感', color: '#6B7280', bgColor: 'bg-gray-500' },
    { name: '罪悪感', color: '#F59E0B', bgColor: 'bg-yellow-500' },
    { name: '寂しさ', color: '#6366F1', bgColor: 'bg-indigo-500' },
    { name: '恥ずかしさ', color: '#EC4899', bgColor: 'bg-pink-500' }
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, timeRange, selectedEmotion]);

  const loadEntries = () => {
    setLoading(true);
    try {
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        setEntries(parsedEntries);
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // 時間範囲でフィルタリング
    const now = new Date();
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => new Date(entry.date) >= weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => new Date(entry.date) >= monthAgo);
    }

    // 感情でフィルタリング
    if (selectedEmotion) {
      filtered = filtered.filter(entry => entry.emotion === selectedEmotion);
    }

    // 日付順でソート
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredEntries(filtered);
  };

  const getWorthlessnessData = () => {
    return filteredEntries
      .filter(entry => entry.emotion === '無価値感')
      .map(entry => ({
        date: entry.date,
        selfEsteem: entry.selfEsteemScore,
        worthlessness: entry.worthlessnessScore
      }));
  };

  const getEmotionFrequency = () => {
    const frequency: { [key: string]: number } = {};
    filteredEntries.forEach(entry => {
      frequency[entry.emotion] = (frequency[entry.emotion] || 0) + 1;
    });
    return frequency;
  };

  const getEmotionColor = (emotion: string) => {
    const emotionData = emotions.find(e => e.name === emotion);
    return emotionData?.color || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleShare = () => {
    const worthlessnessData = getWorthlessnessData();
    const latestEntry = worthlessnessData[worthlessnessData.length - 1];
    
    if (!latestEntry) {
      alert('無価値感のデータがありません。');
      return;
    }

    const shareText = `私の自己肯定感の成長記録 📈\n\n最新スコア:\n自己肯定感: ${latestEntry.selfEsteem}\n無価値感: ${latestEntry.worthlessness}\n\n#かんじょうにっき #自己肯定感 #成長記録\n\n${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'かんじょうにっき - 成長記録',
        text: shareText,
      }).catch((error) => {
        console.log('シェアがキャンセルされました:', error);
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('シェア用テキストをクリップボードにコピーしました！');
      }).catch(() => {
        prompt('以下のテキストをコピーしてSNSでシェアしてください:', shareText);
      });
    }
  };

  const exportData = () => {
    const csvContent = [
      ['日付', '感情', '自己肯定感スコア', '無価値感スコア'],
      ...filteredEntries.map(entry => [
        entry.date,
        entry.emotion,
        entry.selfEsteemScore,
        entry.worthlessnessScore
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `感情データ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 px-2">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-jp-normal">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  const worthlessnessData = getWorthlessnessData();
  const emotionFrequency = getEmotionFrequency();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-2">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">感情の推移グラフ</h1>
            <p className="text-gray-600 font-jp-normal text-sm">
              あなたの感情の変化を可視化して成長を確認しましょう
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>シェア</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>CSV出力</span>
            </button>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-jp-medium text-gray-700">期間:</span>
            <div className="flex space-x-1">
              {[
                { value: 'week', label: '1週間' },
                { value: 'month', label: '1ヶ月' },
                { value: 'all', label: '全期間' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-jp-medium transition-colors ${
                    timeRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-jp-medium text-gray-700">感情:</span>
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-jp-normal focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">すべて</option>
              {emotions.map((emotion) => (
                <option key={emotion.name} value={emotion.name}>
                  {emotion.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-jp-medium text-gray-700">総日記数</span>
            </div>
            <p className="text-2xl font-jp-bold text-blue-600">{filteredEntries.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-jp-medium text-gray-700">無価値感記録</span>
            </div>
            <p className="text-2xl font-jp-bold text-green-600">{worthlessnessData.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-jp-medium text-gray-700">期間</span>
            </div>
            <p className="text-lg font-jp-bold text-purple-600">
              {timeRange === 'week' ? '1週間' : timeRange === 'month' ? '1ヶ月' : '全期間'}
            </p>
          </div>
        </div>
      </div>

      {/* 無価値感推移グラフ */}
      {worthlessnessData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-jp-bold text-gray-900 mb-6">無価値感スコアの推移</h2>
          
          <div className="space-y-6">
            {/* 自己肯定感グラフ */}
            <div>
              <h3 className="text-lg font-jp-semibold text-blue-600 mb-4">自己肯定感スコア</h3>
              <div className="relative h-32 bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <div className="flex items-end space-x-2 h-full min-w-max">
                  {worthlessnessData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div
                        className="bg-blue-500 rounded-t-sm min-w-[24px] transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${(data.selfEsteem / 100) * 80}px` }}
                        title={`${formatDate(data.date)}: ${data.selfEsteem}`}
                      ></div>
                      <span className="text-xs text-gray-500 font-jp-normal transform -rotate-45 origin-left">
                        {formatDate(data.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 無価値感グラフ */}
            <div>
              <h3 className="text-lg font-jp-semibold text-red-600 mb-4">無価値感スコア</h3>
              <div className="relative h-32 bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <div className="flex items-end space-x-2 h-full min-w-max">
                  {worthlessnessData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div
                        className="bg-red-500 rounded-t-sm min-w-[24px] transition-all duration-300 hover:bg-red-600"
                        style={{ height: `${(data.worthlessness / 100) * 80}px` }}
                        title={`${formatDate(data.date)}: ${data.worthlessness}`}
                      ></div>
                      <span className="text-xs text-gray-500 font-jp-normal transform -rotate-45 origin-left">
                        {formatDate(data.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 最新スコア表示 */}
            {worthlessnessData.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-jp-bold text-gray-900 mb-4">最新のスコア</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-jp-medium">自己肯定感</span>
                      <span className="text-2xl font-jp-bold text-blue-600">
                        {worthlessnessData[worthlessnessData.length - 1].selfEsteem}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-red-600 font-jp-medium">無価値感</span>
                      <span className="text-2xl font-jp-bold text-red-600">
                        {worthlessnessData[worthlessnessData.length - 1].worthlessness}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 感情の出現頻度 */}
      {Object.keys(emotionFrequency).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-jp-bold text-gray-900 mb-6">感情の出現頻度</h2>
          
          <div className="space-y-4">
            {Object.entries(emotionFrequency)
              .sort(([,a], [,b]) => b - a)
              .map(([emotion, count]) => {
                const percentage = (count / filteredEntries.length) * 100;
                return (
                  <div key={emotion} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-jp-medium text-gray-700">
                      {emotion}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getEmotionColor(emotion)
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-jp-bold text-white mix-blend-difference">
                          {count}回 ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* データがない場合 */}
      {filteredEntries.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
            データがありません
          </h3>
          <p className="text-gray-400 font-jp-normal">
            日記を書いて感情の推移を確認しましょう
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionChart;