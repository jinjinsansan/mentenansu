import React, { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { getCurrentUser } from '../lib/deviceAuth';
import CounselorComment from '../components/CounselorComment';

const DiaryPage = () => {
  const currentUser = getCurrentUser();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    event: '',
    emotion: '',
    selfEsteemScore: 50,
    worthlessnessScore: 50,
    realization: ''
  });
  
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  // 無価値感スコア用の状態
  const [worthlessnessScores, setWorthlessnessScores] = useState({
    yesterdaySelfEsteem: 50,
    yesterdayWorthlessness: 50,
    todaySelfEsteem: 50,
    todayWorthlessness: 50
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  
  // コンポーネントマウント時に最新の日記を取得
  React.useEffect(() => {
    loadRecentEntries();
  }, []);
  
  const loadRecentEntries = () => {
    try {
      // ローカルストレージから日記データを取得
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        
        // カウンセラーコメントを取得（ローカルストレージから）
        const savedComments = localStorage.getItem('counselorComments');
        if (savedComments) {
          try {
            const comments = JSON.parse(savedComments);
            
            // 各エントリーにコメントを関連付け
            const entriesWithComments = entries.map((entry: any) => {
              const entryComments = comments.filter((c: any) => c.diary_entry_id === entry.id);
              return {
                ...entry,
                counselorComments: entryComments
              };
            });
            
            // 最新の5件を取得
            const sortedEntries = [...entriesWithComments].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setRecentEntries(sortedEntries.slice(0, 5));
          } catch (error) {
            console.error('コメント読み込みエラー:', error);
          }
        } else {
          // コメントがない場合は日記だけ取得
          const sortedEntries = [...entries].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setRecentEntries(sortedEntries.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('最近の日記読み込みエラー:', error);
    }
  };

  const emotions = [
    { 
      name: '恐怖', 
      bgColor: 'bg-purple-100', 
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800',
      selectedBg: 'bg-purple-200',
      selectedBorder: 'border-purple-500'
    },
    { 
      name: '悲しみ', 
      bgColor: 'bg-blue-100', 
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      selectedBg: 'bg-blue-200',
      selectedBorder: 'border-blue-500'
    },
    { 
      name: '怒り', 
      bgColor: 'bg-red-100', 
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      selectedBg: 'bg-red-200',
      selectedBorder: 'border-red-500'
    },
    { 
      name: '悔しい', 
      bgColor: 'bg-green-100', 
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      selectedBg: 'bg-green-200',
      selectedBorder: 'border-green-500'
    },
    { 
      name: '無価値感', 
      bgColor: 'bg-gray-100', 
      borderColor: 'border-gray-400',
      textColor: 'text-gray-800',
      selectedBg: 'bg-gray-200',
      selectedBorder: 'border-gray-600',
      highlighted: true
    },
    { 
      name: '罪悪感', 
      bgColor: 'bg-orange-100', 
      borderColor: 'border-orange-300',
      textColor: 'text-orange-800',
      selectedBg: 'bg-orange-200',
      selectedBorder: 'border-orange-500'
    },
    { 
      name: '寂しさ', 
      bgColor: 'bg-indigo-100', 
      borderColor: 'border-indigo-300',
      textColor: 'text-indigo-800',
      selectedBg: 'bg-indigo-200',
      selectedBorder: 'border-indigo-500'
    },
    { 
      name: '恥ずかしさ', 
      bgColor: 'bg-pink-100', 
      borderColor: 'border-pink-300',
      textColor: 'text-pink-800',
      selectedBg: 'bg-pink-200',
      selectedBorder: 'border-pink-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emotion || !formData.event.trim()) {
      alert('感情と出来事を入力してください。');
      return;
    }

    setSaving(true);

    try {
      // 最初にやることページで保存されたスコアを取得
      const savedInitialScores = localStorage.getItem('initialScores');
      let finalFormData = { ...formData };
      
      // 一番最初の日記で無価値感を選んだ場合、保存されたスコアを使用
      if (formData.emotion === '無価値感' && savedInitialScores) {
        const existingEntries = localStorage.getItem('journalEntries');
        const entries = existingEntries ? JSON.parse(existingEntries) : [];
        
        // 無価値感の日記が初回の場合
        const worthlessnessEntries = entries.filter((entry: any) => entry.emotion === '無価値感');
        
        if (worthlessnessEntries.length === 0) {
          // 初回の無価値感日記の場合、保存されたスコアを使用
          const initialScores = JSON.parse(savedInitialScores);
          if (initialScores.selfEsteemScore && initialScores.worthlessnessScore) {
            finalFormData = {
              ...formData,
              selfEsteemScore: parseInt(initialScores.selfEsteemScore),
              worthlessnessScore: parseInt(initialScores.worthlessnessScore)
            };
            
            // worthlessnessScoresの状態も更新
            setWorthlessnessScores(prev => ({
              ...prev,
              todaySelfEsteem: parseInt(initialScores.selfEsteemScore),
              todayWorthlessness: parseInt(initialScores.worthlessnessScore)
            }));
          }
        }
      }
      
      // ローカルストレージに保存
      const existingEntries = localStorage.getItem('journalEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      
      const newEntry = {
        id: Date.now().toString(),
        date: finalFormData.date,
        emotion: finalFormData.emotion,
        event: finalFormData.event,
        realization: finalFormData.realization,
        selfEsteemScore: finalFormData.emotion === '無価値感' ? worthlessnessScores.todaySelfEsteem : finalFormData.selfEsteemScore,
        worthlessnessScore: finalFormData.emotion === '無価値感' ? worthlessnessScores.todayWorthlessness : finalFormData.worthlessnessScore
      };
      
      entries.unshift(newEntry);
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      
      // 最近の日記を更新
      loadRecentEntries();
      
      alert('日記を保存しました！');
    
      // フォームをリセット
      setFormData({
        date: new Date().toISOString().split('T')[0],
        event: '',
        emotion: '',
        selfEsteemScore: 50,
        worthlessnessScore: 50,
        realization: ''
      });
      setWorthlessnessScores({
        yesterdaySelfEsteem: 50,
        yesterdayWorthlessness: 50,
        todaySelfEsteem: 50,
        todayWorthlessness: 50
      });
      
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const username = currentUser?.lineUsername || 'ユーザー';
    const shareText = `${username}の今日の感情日記 📝\n\n感情: ${formData.emotion}\n\n#かんじょうにっき #感情日記 #自己肯定感\n\n${window.location.origin}`;
    
    if (navigator.share) {
      // Web Share API が利用可能な場合
      navigator.share({
        title: 'かんじょうにっき',
        text: shareText,
      }).catch((error) => {
        console.log('シェアがキャンセルされました:', error);
      });
    } else {
      // Web Share API が利用できない場合はクリップボードにコピー
      navigator.clipboard.writeText(shareText).then(() => {
        alert('シェア用テキストをクリップボードにコピーしました！\nSNSに貼り付けてシェアしてください。');
      }).catch(() => {
        // クリップボードAPIも使えない場合は手動でテキストを表示
        prompt('以下のテキストをコピーしてSNSでシェアしてください:', shareText);
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日 (${dayOfWeek})`;
  };

  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, firstDay, lastDay };
  };

  const handleDateSelect = (selectedDate: Date) => {
    // タイムゾーンを考慮した正確な日付文字列を生成
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    setFormData({...formData, date: dateString});
    setShowCalendar(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };

  // 自己肯定感スコア変更時の無価値感スコア自動計算
  const handleSelfEsteemChange = (field: 'yesterdaySelfEsteem' | 'todaySelfEsteem', value: number) => {
    const worthlessnessField = field === 'yesterdaySelfEsteem' ? 'yesterdayWorthlessness' : 'todayWorthlessness';
    const calculatedWorthlessness = 100 - value;
    
    setWorthlessnessScores(prev => ({
      ...prev,
      [field]: value,
      [worthlessnessField]: calculatedWorthlessness
    }));
  };

  // 無価値感スコア直接変更時の自己肯定感スコア自動計算
  const handleWorthlessnessChange = (field: 'yesterdayWorthlessness' | 'todayWorthlessness', value: number) => {
    const selfEsteemField = field === 'yesterdayWorthlessness' ? 'yesterdaySelfEsteem' : 'todaySelfEsteem';
    const calculatedSelfEsteem = 100 - value;
    
    setWorthlessnessScores(prev => ({
      ...prev,
      [field]: value,
      [selfEsteemField]: calculatedSelfEsteem
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-2">
      {/* 今日の出来事セクション */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-jp-bold text-gray-900">今日の出来事</h2>
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 font-jp-normal hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{formatDate(formData.date)}</span>
            </button>

            {/* カレンダーポップアップ */}
            {showCalendar && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80 max-w-[calc(100vw-2rem)]">
                {/* カレンダーヘッダー */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="font-jp-bold text-gray-900">
                    {calendarDate.getFullYear()}年{calendarDate.getMonth() + 1}月
                  </h3>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                    <div key={day} className="text-center text-xs font-jp-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダー日付 */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendar(calendarDate).days.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                    const isSelected = day.toISOString().split('T')[0] === formData.date;
                    const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day)}
                        className={`
                          w-8 h-8 text-xs font-jp-normal rounded transition-colors
                          ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                          ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                        `}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* 閉じるボタン */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 font-jp-normal"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-4">
          <p className="text-gray-600 font-jp-normal text-sm mb-4">
            嫌な気持ちになった出来事を書いてみましょう
          </p>
          <div className="relative overflow-hidden">
            {/* 罫線背景 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden" style={{
                backgroundImage: `
                  linear-gradient(to bottom, transparent 0px, transparent 31px, #e5e7eb 31px, #e5e7eb 32px),
                  linear-gradient(to right, #ef4444 0px, #ef4444 2px, transparent 2px)
                `,
                backgroundSize: '100% 32px, 100% 100%',
                backgroundPosition: '0 16px, 24px 0'
              }}>
                {/* 左マージン線 */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-red-300"></div>
                {/* 穴あけ部分（3つ穴） */}
                <div className="absolute left-3 top-8">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mb-16"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full mb-16"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* テキストエリア */}
            <textarea
              value={formData.event}
              onChange={(e) => setFormData({...formData, event: e.target.value})}
              className="relative w-full h-64 p-4 pl-8 bg-transparent border-none resize-none focus:outline-none font-jp-normal text-gray-800 leading-8 overflow-hidden"
              placeholder=""
              style={{
                lineHeight: '32px',
                paddingTop: '16px'
              }}
            />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-800 font-jp-normal">
              <p className="font-jp-medium">思い出すのがつらい場合は、無理をしないでください。</p>
              <p>書ける範囲で、あなたのペースで大丈夫です。</p>
            </div>
          </div>
        </div>

      </div>

      {/* 今日の気持ちセクション */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-jp-bold text-gray-900 mb-4">今日の気持ち</h2>

        <div className="mb-6">
          <p className="text-gray-700 font-jp-normal mb-4 text-sm">
            どの気持ちに近いですか？
          </p>

          <div className="grid grid-cols-2 gap-3">
            {emotions.map((emotion) => (
              <label
                key={emotion.name}
                className={`flex items-center space-x-2 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 text-sm sm:text-base ${
                  formData.emotion === emotion.name
                    ? `${emotion.selectedBg} ${emotion.selectedBorder} shadow-md transform scale-105`
                    : `${emotion.bgColor} ${emotion.borderColor} hover:shadow-sm hover:scale-102`
                }`}
              >
                <input
                  type="radio"
                  name="emotion"
                  value={emotion.name}
                  checked={formData.emotion === emotion.name}
                  onChange={(e) => setFormData({...formData, emotion: e.target.value})}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className={`w-3 h-3 rounded-full ${
                  formData.emotion === emotion.name 
                    ? emotion.selectedBorder.replace('border-', 'bg-')
                    : emotion.borderColor.replace('border-', 'bg-')
                }`}></div>
                <span className={`font-jp-semibold text-sm sm:text-base ${emotion.textColor} ${
                  formData.emotion === emotion.name ? 'font-jp-bold' : ''
                }`}>
                  {emotion.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 無価値感を選んだ場合のスコア入力 */}
        {formData.emotion === '無価値感' && (
          <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200 mb-6">
            <h3 className="text-red-800 font-jp-bold mb-4">
              「無価値感」を選んだ場合のみ入力
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 前日のスコア */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-jp-bold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  前日のスコア
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      自己肯定感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={worthlessnessScores.yesterdaySelfEsteem}
                      onChange={(e) => handleSelfEsteemChange('yesterdaySelfEsteem', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      無価値感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={worthlessnessScores.yesterdayWorthlessness}
                      onChange={(e) => handleWorthlessnessChange('yesterdayWorthlessness', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>

              {/* 今日のスコア */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-jp-bold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  今日のスコア
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      自己肯定感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={worthlessnessScores.todaySelfEsteem}
                      onChange={(e) => handleSelfEsteemChange('todaySelfEsteem', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-jp-medium text-gray-600 mb-1">
                      無価値感
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={worthlessnessScores.todayWorthlessness}
                      onChange={(e) => handleWorthlessnessChange('todayWorthlessness', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-800 font-jp-normal space-y-1">
                <p className="font-jp-medium">💡 自動計算機能</p>
                <p>• 自己肯定感スコアを入力すると、無価値感スコアが自動で計算されます</p>
                <p>• 計算式：無価値感スコア = 100 - 自己肯定感スコア</p>
                <p>• どちらの項目からでも入力可能です</p>
              </div>
            </div>
          </div>
        )}

        {/* 今日の小さな気づき */}
        <div className="mb-6">
          <h3 className="text-lg font-jp-bold text-gray-900 mb-4">今日の小さな気づき</h3>
          <textarea
            value={formData.realization}
            onChange={(e) => setFormData({...formData, realization: e.target.value})}
           className="relative w-full h-32 p-4 pl-8 bg-white border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-gray-800 leading-8 overflow-hidden"
            placeholder=""
           style={{
             backgroundImage: `
               linear-gradient(to bottom, transparent 0px, transparent 31px, #e5e7eb 31px, #e5e7eb 32px),
               linear-gradient(to right, #ef4444 0px, #ef4444 2px, transparent 2px)
             `,
             backgroundSize: '100% 32px, 100% 100%',
             backgroundPosition: '0 16px, 24px 0',
             lineHeight: '32px',
             paddingTop: '16px'
           }}
          />
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">⭐</span>
            <div className="text-sm text-yellow-800 font-jp-normal">
              <p className="font-jp-medium">感情に良い悪いはありません。すべて大切な気持ちです。</p>
              <p>小さな変化も大きな成長です。自分を褒めてあげてください。</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近のカウンセラーコメント */}
      {recentEntries.some(entry => entry.counselorComments && entry.counselorComments.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-jp-bold text-gray-900 mb-6">最近のカウンセラーコメント</h2>
          <div className="space-y-4">
            {recentEntries
              .filter(entry => entry.counselorComments && entry.counselorComments.length > 0)
              .slice(0, 3)
              .map(entry => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-jp-medium border ${getEmotionColor(entry.emotion)}`}>
                      {entry.emotion}
                    </span>
                    <span className="text-gray-500 text-xs font-jp-normal">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-jp-normal leading-relaxed mb-3 line-clamp-2">
                    {entry.event}
                  </p>
                  {entry.counselorComments.map((comment: any) => (
                    <CounselorComment 
                      key={comment.id} 
                      comment={comment} 
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-8">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>日記を保存</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleShare}
          disabled={saving}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-jp-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
        >
          <Share2 className="w-5 h-5" />
          <span>SNSでシェア</span>
        </button>
      </div>
      
      {/* ローカル保存モード表示 */}
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800 font-jp-medium text-sm">ローカル保存モード</span>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;