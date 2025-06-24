import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Search, BarChart3, Users, Settings, MessageCircle, Shield, User, Menu, X } from 'lucide-react';
import { useMaintenanceStatus } from './hooks/useMaintenanceStatus';
import { useAutoSync } from './hooks/useAutoSync';
import MaintenanceMode from './components/MaintenanceMode';
import PrivacyConsent from './components/PrivacyConsent';
import AdminPanel from './components/AdminPanel';
import Chat from './components/Chat';

// Pages
import DiaryPage from './pages/DiaryPage';
import DiarySearchPage from './pages/DiarySearchPage';
import EmotionTypes from './pages/EmotionTypes';
import FirstSteps from './pages/FirstSteps';
import NextSteps from './pages/NextSteps';
import HowTo from './pages/HowTo';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Chart component
import EmotionChart from './components/EmotionChart';

function App() {
  const [currentPage, setCurrentPage] = useState('diary');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [privacyConsentGiven, setPrivacyConsentGiven] = useState<boolean | null>(null);
  const [lineUsername, setLineUsername] = useState<string | null>(null);

  const { isMaintenanceMode, config: maintenanceConfig } = useMaintenanceStatus();
  
  // 自動同期フックを使用
  useAutoSync();

  useEffect(() => {
    // プライバシー同意状況をチェック
    const consentGiven = localStorage.getItem('privacyConsentGiven');
    const savedUsername = localStorage.getItem('line-username');
    
    if (consentGiven === 'true') {
      setPrivacyConsentGiven(true);
      setLineUsername(savedUsername);
    } else if (consentGiven === 'false') {
      setPrivacyConsentGiven(false);
    } else {
      setPrivacyConsentGiven(null);
    }

    // テストデータの生成（初回のみ）
    generateTestDataIfNeeded();
  }, []);

  const generateTestDataIfNeeded = () => {
    const existingEntries = localStorage.getItem('journalEntries');
    if (!existingEntries) {
      const testEntries = generateTestData();
      localStorage.setItem('journalEntries', JSON.stringify(testEntries));
    }
  };

  const generateTestData = () => {
    const emotions = ['恐怖', '悲しみ', '怒り', '悔しい', '無価値感', '罪悪感', '寂しさ', '恥ずかしさ'];
    const events = [
      '上司に厳しく叱られた',
      '友人との約束をすっぽかしてしまった',
      '大切なプレゼンで失敗した',
      '家族と喧嘩をした',
      '電車で席を譲れなかった',
      '同僚に嫌味を言われた',
      'テストで悪い点を取った',
      '恋人と別れ話になった',
      '仕事でミスをして迷惑をかけた',
      '親に心配をかけてしまった'
    ];
    
    const realizations = [
      '完璧でなくても大丈夫だと思えた',
      '失敗から学ぶことができた',
      '周りの人が支えてくれていることに気づいた',
      '自分なりに頑張っていることを認めたい',
      '小さな成長も大切だと感じた',
      '明日は新しい日だと思える',
      '感情を受け入れることも大切だと学んだ',
      '一歩ずつ前進していこうと思う',
      '自分を責めすぎないようにしたい',
      '今日の経験も成長の一部だと思う'
    ];

    const testData = [];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const event = events[Math.floor(Math.random() * events.length)];
      const realization = realizations[Math.floor(Math.random() * realizations.length)];
      
      let selfEsteemScore = Math.floor(Math.random() * 40) + 30; // 30-70
      let worthlessnessScore = 100 - selfEsteemScore;
      
      // 無価値感以外の感情の場合はデフォルト値
      if (emotion !== '無価値感') {
        selfEsteemScore = 50;
        worthlessnessScore = 50;
      }
      
      testData.push({
        id: `test-${i}`,
        date: date.toISOString().split('T')[0],
        emotion,
        event,
        realization,
        selfEsteemScore,
        worthlessnessScore
      });
    }
    
    return testData;
  };

  const handlePrivacyConsent = (accepted: boolean) => {
    setPrivacyConsentGiven(accepted);
    localStorage.setItem('privacyConsentGiven', accepted.toString());
    localStorage.setItem('privacyConsentDate', new Date().toISOString());
    
    if (!accepted) {
      // 同意しない場合の処理
      alert('プライバシーポリシーに同意いただけない場合、本サービスをご利用いただけません。');
      return;
    }
    
    // 同意した場合、ユーザー名入力を促す
    const username = prompt('LINEユーザー名を入力してください:');
    if (username && username.trim()) {
      setLineUsername(username.trim());
      localStorage.setItem('line-username', username.trim());
    }
  };

  // メンテナンスモード中の場合
  if (isMaintenanceMode && maintenanceConfig) {
    return <MaintenanceMode config={maintenanceConfig} />;
  }

  // プライバシー同意が未確認の場合
  if (privacyConsentGiven === null) {
    return <PrivacyConsent onConsent={handlePrivacyConsent} />;
  }

  // プライバシー同意を拒否した場合
  if (privacyConsentGiven === false) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-xl font-jp-bold text-gray-900 mb-4">
            ご利用いただけません
          </h1>
          <p className="text-gray-600 font-jp-normal mb-6">
            プライバシーポリシーに同意いただけない場合、本サービスをご利用いただけません。
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('privacyConsentGiven');
              localStorage.removeItem('privacyConsentDate');
              setPrivacyConsentGiven(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-medium transition-colors"
          >
            最初に戻る
          </button>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'diary', label: '日記を書く', icon: BookOpen },
    { id: 'search', label: '日記を探す', icon: Search },
    { id: 'chart', label: '推移グラフ', icon: BarChart3 },
    { id: 'emotions', label: '感情の種類', icon: Heart },
    { id: 'first-steps', label: '最初にやること', icon: User },
    { id: 'next-steps', label: '次にやること', icon: Settings },
    { id: 'how-to', label: '使い方', icon: BookOpen },
    { id: 'support', label: 'サポート', icon: Users },
    { id: 'privacy', label: 'プライバシー', icon: Shield }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'diary':
        return <DiaryPage />;
      case 'search':
        return <DiarySearchPage />;
      case 'chart':
        return <EmotionChart />;
      case 'emotions':
        return <EmotionTypes />;
      case 'first-steps':
        return <FirstSteps />;
      case 'next-steps':
        return <NextSteps />;
      case 'how-to':
        return <HowTo />;
      case 'support':
        return <Support />;
      case 'privacy':
        return <PrivacyPolicy />;
      default:
        return <DiaryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-jp-bold text-gray-900">かんじょうにっき</h1>
                <p className="text-xs text-gray-500 font-jp-normal">感情日記アプリ</p>
              </div>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-jp-medium transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* 右側のボタン */}
            <div className="flex items-center space-x-2">
              {/* チャットボタン */}
              <button
                onClick={() => setShowChat(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="チャット"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* カウンセラーログインボタン */}
              <button
                onClick={() => setShowAdminPanel(true)}
                className="hidden sm:flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-jp-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>カウンセラー</span>
              </button>

              {/* モバイルメニューボタン */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderCurrentPage()}
      </main>

      {/* モバイルメニュー */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-jp-bold text-gray-900">メニュー</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-jp-medium transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setShowAdminPanel(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 bg-green-600 text-white rounded-lg text-sm font-jp-medium transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>カウンセラーログイン</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* 管理画面モーダル */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* チャットモーダル */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-jp-bold text-gray-900">チャット</h2>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat />
            </div>
          </div>
        </div>
      )}

      {/* ユーザー情報表示 */}
      {lineUsername && (
        <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 font-jp-medium text-sm">{lineUsername}さん</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;