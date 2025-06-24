import React, { useState, useEffect } from 'react';
import { MessageCircle, BookOpen, Search, User, Info, Heart, List, Settings, LogIn } from 'lucide-react';
import { useMaintenanceStatus } from './hooks/useMaintenanceStatus';
import { useAutoSync } from './hooks/useAutoSync';
import { useSupabase } from './hooks/useSupabase';
import { getCurrentUser, getAuthSession } from './lib/deviceAuth';
import { saveSampleCounselorComments } from './utils/sampleData';

// コンポーネントのインポート
import MaintenanceMode from './components/MaintenanceMode';
import PrivacyConsent from './components/PrivacyConsent';
import AdminPanel from './components/AdminPanel';
import Chat from './components/Chat';
import DataMigration from './components/DataMigration';
import DeviceAuthLogin from './components/DeviceAuthLogin';
import DeviceAuthRegistration from './components/DeviceAuthRegistration';

// ページコンポーネントのインポート
import DiaryPage from './pages/DiaryPage';
import DiarySearchPage from './pages/DiarySearchPage';
import FirstSteps from './pages/FirstSteps';
import NextSteps from './pages/NextSteps';
import HowTo from './pages/HowTo';
import EmotionTypes from './pages/EmotionTypes';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('diary');
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [lineUsername, setLineUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDeviceAuth, setShowDeviceAuth] = useState(false);
  const [showDeviceRegistration, setShowDeviceRegistration] = useState(false);
  
  const { isMaintenanceMode, config, refreshStatus } = useMaintenanceStatus();
  const { isConnected } = useSupabase();
  
  // 自動同期フックを使用
  useAutoSync();

  useEffect(() => {
    // プライバシーポリシー同意確認
    const consentGiven = localStorage.getItem('privacyConsentGiven');
    if (consentGiven !== 'true') {
      setShowPrivacyConsent(true);
    }

    // LINEユーザー名の取得
    const savedUsername = localStorage.getItem('line-username');
    if (savedUsername) {
      setLineUsername(savedUsername);
    }
    
    // デバイス認証状態の確認
    const session = getAuthSession();
    if (session) {
      setLineUsername(session.lineUsername);
    }
    
    // サンプルデータの生成
    generateSampleData();
    
  }, []);

  // サンプルデータの生成
  const generateSampleData = () => {
    // 日記データがない場合はサンプルデータを生成
    const savedEntries = localStorage.getItem('journalEntries');
    if (!savedEntries) {
      generateSampleEntries();
    }
    
    // カウンセラーコメントのサンプルデータを生成
    saveSampleCounselorComments();
  };

  // サンプル日記エントリーの生成
  const generateSampleEntries = () => {
    const emotions = ['恐怖', '悲しみ', '怒り', '悔しい', '無価値感', '罪悪感', '寂しさ', '恥ずかしさ'];
    const events = [
      '会議で自分の意見が採用されなかった。みんなの前で否定された気がして、自分は価値のない人間だと感じた。',
      '友人との約束をドタキャンされた。楽しみにしていたのに、一人で過ごすことになった。',
      '電車で席を譲らない人を見てイライラした。マナーの悪さに腹が立った。',
      '大事なプレゼンで緊張して上手く話せなかった。失敗して恥ずかしかった。',
      '親しい人から批判された。自分の欠点を指摘されて傷ついた。',
      '大切にしていた物をなくした。自分の不注意が原因で申し訳ない気持ちになった。',
      '友人のグループから誘われなかった。仲間外れにされた気がして寂しかった。',
      '突然の大きな音に驚いて動悸がした。何が起きたのか分からず怖かった。'
    ];
    const realizations = [
      '自分の意見が否定されても、自分自身が否定されたわけではないと気づいた。',
      '一人の時間も大切にできることがあると気づいた。',
      '相手にも事情があるかもしれないと考えてみた。',
      '失敗は成長の機会だと捉えることができた。',
      '批判は自分を向上させるためのものかもしれないと思った。',
      '自分を責めすぎず、次に活かす方法を考えてみた。',
      '自分から積極的に関わることも大切だと気づいた。',
      '恐怖を感じても、冷静に状況を確認することが大切だと分かった。'
    ];

    const entries = [];
    const today = new Date();
    
    // 過去20日分のデータを生成
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const event = events[Math.floor(Math.random() * events.length)];
      const realization = realizations[Math.floor(Math.random() * realizations.length)];
      
      let selfEsteemScore = 50;
      let worthlessnessScore = 50;
      
      if (emotion === '無価値感') {
        selfEsteemScore = Math.floor(Math.random() * 40) + 10; // 10-50
        worthlessnessScore = 100 - selfEsteemScore;
      }
      
      entries.push({
        id: `entry_${Date.now()}_${i}`,
        date: dateString,
        emotion,
        event,
        realization,
        selfEsteemScore,
        worthlessnessScore
      });
    }
    
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    console.log('20日分のサンプル日記データを生成しました');
  };

  const handlePrivacyConsent = (accepted: boolean) => {
    if (accepted) {
      localStorage.setItem('privacyConsentGiven', 'true');
      localStorage.setItem('privacyConsentDate', new Date().toISOString());
      setShowPrivacyConsent(false);
    } else {
      alert('プライバシーポリシーに同意いただけない場合、サービスをご利用いただけません。');
    }
  };

  const handleSetUsername = (username: string) => {
    localStorage.setItem('line-username', username);
    setLineUsername(username);
  };

  const handleAdminLogin = () => {
    const email = prompt('カウンセラーメールアドレスを入力してください');
    const password = prompt('パスワードを入力してください');
    
    // 簡易的な認証（実際の実装ではSupabaseなどの認証を使用）
    if (email && password === 'counselor123') {
      const validEmails = [
        'jin@namisapo.com',
        'aoi@namisapo.com',
        'asami@namisapo.com',
        'shu@namisapo.com',
        'yucha@namisapo.com',
        'sammy@namisapo.com'
      ];
      
      if (validEmails.includes(email)) {
        setIsAdmin(true);
        alert('カウンセラーとしてログインしました');
      } else {
        alert('無効なメールアドレスです');
      }
    } else {
      alert('認証に失敗しました');
    }
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      setIsAdmin(false);
      setActiveTab('diary');
    }
  };

  const handleDeviceAuthLogin = (username: string) => {
    setLineUsername(username);
    setShowDeviceAuth(false);
  };

  const handleDeviceAuthRegister = (username: string) => {
    setLineUsername(username);
    setShowDeviceRegistration(false);
  };

  // メンテナンスモードの場合
  if (isMaintenanceMode && config) {
    return <MaintenanceMode config={config} onRetry={refreshStatus} />;
  }

  // プライバシーポリシー同意画面
  if (showPrivacyConsent) {
    return <PrivacyConsent onConsent={handlePrivacyConsent} />;
  }

  // デバイス認証画面
  if (showDeviceAuth) {
    return (
      <DeviceAuthLogin
        onLoginSuccess={handleDeviceAuthLogin}
        onRegister={() => {
          setShowDeviceAuth(false);
          setShowDeviceRegistration(true);
        }}
        onBack={() => setShowDeviceAuth(false)}
      />
    );
  }

  // デバイス登録画面
  if (showDeviceRegistration) {
    return (
      <DeviceAuthRegistration
        onRegistrationComplete={handleDeviceAuthRegister}
        onBack={() => setShowDeviceRegistration(false)}
      />
    );
  }

  // ユーザー名入力画面
  if (!lineUsername && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
              かんじょうにっき
            </h1>
            <p className="text-gray-600 font-jp-normal">
              自己肯定感を育てる感情日記アプリ
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                LINEユーザー名を入力
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                placeholder="例: ユーザー名"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      handleSetUsername(input.value.trim());
                    }
                  }
                }}
              />
            </div>

            <button
              onClick={() => {
                const input = document.getElementById('username') as HTMLInputElement;
                if (input.value.trim()) {
                  handleSetUsername(input.value.trim());
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg"
            >
              はじめる
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDeviceAuth(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-jp-medium"
              >
                デバイス認証でログイン
              </button>
              
              <button
                onClick={handleAdminLogin}
                className="text-gray-500 hover:text-gray-700 text-sm font-jp-medium"
              >
                カウンセラーログイン
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 管理者画面
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 pb-12">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-jp-bold text-gray-900">かんじょうにっき 管理画面</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 font-jp-medium text-sm"
            >
              ログアウト
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <AdminPanel />
        </main>
      </div>
    );
  }

  // メインアプリ
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-jp-bold text-gray-900">かんじょうにっき</h1>
          <p className="text-sm text-gray-600 font-jp-normal">
            {lineUsername}さん、こんにちは
            {isConnected && <span className="text-green-600 ml-2">• Supabase接続中</span>}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'diary' && <DiaryPage />}
        {activeTab === 'search' && <DiarySearchPage />}
        {activeTab === 'first-steps' && <FirstSteps />}
        {activeTab === 'next-steps' && <NextSteps />}
        {activeTab === 'how-to' && <HowTo />}
        {activeTab === 'emotion-types' && <EmotionTypes />}
        {activeTab === 'support' && <Support />}
        {activeTab === 'privacy' && <PrivacyPolicy />}
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'data' && <DataMigration />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between overflow-x-auto">
            <button
              onClick={() => setActiveTab('diary')}
              className={`flex flex-col items-center py-3 px-2 ${
                activeTab === 'diary' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-xs mt-1 font-jp-medium">日記</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center py-3 px-2 ${
                activeTab === 'search' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs mt-1 font-jp-medium">検索</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center py-3 px-2 ${
                activeTab === 'chat' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1 font-jp-medium">チャット</span>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex flex-col items-center py-3 px-2 ${
                activeTab === 'data' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs mt-1 font-jp-medium">設定</span>
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'info' ? 'diary' : 'info')}
              className={`flex flex-col items-center py-3 px-2 ${
                activeTab === 'info' || activeTab === 'first-steps' || activeTab === 'next-steps' || 
                activeTab === 'how-to' || activeTab === 'emotion-types' || activeTab === 'support' || 
                activeTab === 'privacy'
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info className="w-6 h-6" />
              <span className="text-xs mt-1 font-jp-medium">情報</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 情報メニュー */}
      {activeTab === 'info' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white rounded-t-xl w-full max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-jp-bold text-gray-900 mb-6">情報メニュー</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setActiveTab('first-steps')}
                  className="flex items-center space-x-3 w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">1</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-jp-semibold text-gray-900">最初にやること</h3>
                    <p className="text-sm text-gray-600 font-jp-normal">自己肯定感スコアの計測</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('next-steps')}
                  className="flex items-center space-x-3 w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">2</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-jp-semibold text-gray-900">次にやること</h3>
                    <p className="text-sm text-gray-600 font-jp-normal">日記の書き方</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('how-to')}
                  className="flex items-center space-x-3 w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-jp-semibold text-gray-900">使い方</h3>
                    <p className="text-sm text-gray-600 font-jp-normal">かんじょうにっきの目的</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('emotion-types')}
                  className="flex items-center space-x-3 w-full p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <List className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-jp-semibold text-gray-900">感情の種類</h3>
                    <p className="text-sm text-gray-600 font-jp-normal">8つのネガティブ感情</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('support')}
                  className="flex items-center space-x-3 w-full p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-jp-semibold text-gray-900">サポート付き</h3>
                    <p className="text-sm text-gray-600 font-jp-normal">専属カウンセラーによるサポート</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className="flex items-center space-x-3 w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <LogIn className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-jp-semibold text-gray-900">プライバシーポリシー</h3>
                    <p className="text-sm text-gray-600 font-jp-normal">個人情報の取り扱いについて</p>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setActiveTab('diary')}
                className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-jp-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;