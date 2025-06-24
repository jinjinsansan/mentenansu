import React, { useState, useEffect } from 'react';
import { useMaintenanceStatus } from './hooks/useMaintenanceStatus';
import { useAutoSync } from './hooks/useAutoSync';
import { getAuthSession, isAuthenticated, getCurrentUser } from './lib/deviceAuth';
import MaintenanceMode from './components/MaintenanceMode';
import PrivacyConsent from './components/PrivacyConsent';
import DeviceAuthLogin from './components/DeviceAuthLogin';
import DeviceAuthRegistration from './components/DeviceAuthRegistration';
import DiaryPage from './pages/DiaryPage';
import DiarySearchPage from './pages/DiarySearchPage';
import EmotionTypes from './pages/EmotionTypes';
import FirstSteps from './pages/FirstSteps';
import NextSteps from './pages/NextSteps';
import HowTo from './pages/HowTo';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminPanel from './components/AdminPanel';
import DataMigration from './components/DataMigration';
import Chat from './components/Chat';

const App: React.FC = () => {
  const { isMaintenanceMode, config } = useMaintenanceStatus();
  const [privacyConsentGiven, setPrivacyConsentGiven] = useState<boolean | null>(null);
  const [lineUsername, setLineUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('diary');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showDataMigration, setShowDataMigration] = useState(false);
  const [showDeviceAuth, setShowDeviceAuth] = useState(false);
  const [deviceAuthMode, setDeviceAuthMode] = useState<'login' | 'register'>('login');
  const [isDeviceAuthEnabled, setIsDeviceAuthEnabled] = useState(false);
  
  // 自動同期フックを使用
  useAutoSync();

  // 初期化
  useEffect(() => {
    // プライバシーポリシー同意状態を確認
    const consentGiven = localStorage.getItem('privacyConsentGiven');
    setPrivacyConsentGiven(consentGiven === 'true');

    // ユーザー名を確認
    const savedUsername = localStorage.getItem('line-username');
    setLineUsername(savedUsername);

    // デバイス認証の有効/無効を確認
    const deviceAuthEnabled = localStorage.getItem('device_auth_enabled') === 'true';
    setIsDeviceAuthEnabled(deviceAuthEnabled);

    // デバイス認証が有効で、認証済みでない場合はデバイス認証画面を表示
    if (deviceAuthEnabled && !isAuthenticated()) {
      setShowDeviceAuth(true);
    }
  }, []);

  // プライバシーポリシー同意処理
  const handlePrivacyConsent = (accepted: boolean) => {
    if (accepted) {
      localStorage.setItem('privacyConsentGiven', 'true');
      localStorage.setItem('privacyConsentDate', new Date().toISOString());
      setPrivacyConsentGiven(true);
    } else {
      // 同意しない場合の処理
      alert('プライバシーポリシーに同意いただけない場合、サービスをご利用いただけません。');
    }
  };

  // ユーザー名設定処理
  const handleSetUsername = (username: string) => {
    localStorage.setItem('line-username', username);
    setLineUsername(username);
  };

  // デバイス認証ログイン成功時の処理
  const handleDeviceAuthSuccess = (username: string) => {
    setShowDeviceAuth(false);
    if (!lineUsername) {
      handleSetUsername(username);
    }
  };

  // タブ切り替え
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // 管理者パネル表示切り替え
  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
    if (showAdminPanel) {
      setActiveTab('diary');
    }
  };

  // データ移行画面表示切り替え
  const toggleDataMigration = () => {
    setShowDataMigration(!showDataMigration);
    if (showDataMigration) {
      setActiveTab('diary');
    }
  };

  // メンテナンスモード中の表示
  if (isMaintenanceMode && config) {
    return <MaintenanceMode config={config} />;
  }

  // プライバシーポリシー同意前の表示
  if (privacyConsentGiven === false || privacyConsentGiven === null) {
    return <PrivacyConsent onConsent={handlePrivacyConsent} />;
  }

  // デバイス認証が有効で、認証が必要な場合の表示
  if (isDeviceAuthEnabled && showDeviceAuth) {
    return deviceAuthMode === 'login' ? (
      <DeviceAuthLogin 
        onLoginSuccess={handleDeviceAuthSuccess}
        onRegister={() => setDeviceAuthMode('register')}
        onBack={() => {
          setShowDeviceAuth(false);
          setIsDeviceAuthEnabled(false);
          localStorage.setItem('device_auth_enabled', 'false');
        }}
      />
    ) : (
      <DeviceAuthRegistration
        onRegistrationComplete={handleDeviceAuthSuccess}
        onBack={() => setDeviceAuthMode('login')}
      />
    );
  }

  // ユーザー名設定前の表示
  if (!lineUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-6 text-center">
            ようこそ！
          </h1>
          <p className="text-gray-600 font-jp-normal mb-6 text-center">
            かんじょうにっきを始めるために、あなたのお名前を教えてください。
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector('input');
              if (input && input.value.trim()) {
                handleSetUsername(input.value.trim());
              }
            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="あなたのお名前"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
              required
              maxLength={30}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg"
            >
              始める
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 管理者パネル表示
  if (showAdminPanel) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-jp-bold text-gray-900">
              かんじょうにっき - 管理画面
            </h1>
            <button
              onClick={toggleAdminPanel}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-jp-medium transition-colors"
            >
              ユーザー画面に戻る
            </button>
          </div>
          <AdminPanel />
        </div>
      </div>
    );
  }

  // データ移行画面表示
  if (showDataMigration) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-jp-bold text-gray-900">
              かんじょうにっき - データ管理
            </h1>
            <button
              onClick={toggleDataMigration}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-jp-medium transition-colors"
            >
              ユーザー画面に戻る
            </button>
          </div>
          <DataMigration />
        </div>
      </div>
    );
  }

  // メインアプリ表示
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-jp-bold text-gray-900">
              かんじょうにっき
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-jp-normal">
                {lineUsername}さん
              </span>
              <div className="relative group">
                <button
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => {}}
                >
                  ⚙️
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 hidden group-hover:block">
                  <div className="py-1">
                    <button
                      onClick={toggleAdminPanel}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      管理者パネル
                    </button>
                    <button
                      onClick={toggleDataMigration}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      データ管理
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('ログアウトしますか？')) {
                          localStorage.removeItem('line-username');
                          setLineUsername(null);
                        }
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-1 sm:space-x-4 py-2">
            {[
              { id: 'diary', label: '日記作成' },
              { id: 'search', label: '日記検索' },
              { id: 'emotions', label: '感情の種類' },
              { id: 'first-steps', label: '最初にやること' },
              { id: 'next-steps', label: '次にやること' },
              { id: 'how-to', label: '使い方' },
              { id: 'support', label: 'サポート' },
              { id: 'privacy', label: 'プライバシー' },
              { id: 'chat', label: 'チャット' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap px-3 py-2 text-sm font-jp-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'diary' && <DiaryPage />}
        {activeTab === 'search' && <DiarySearchPage />}
        {activeTab === 'emotions' && <EmotionTypes />}
        {activeTab === 'first-steps' && <FirstSteps />}
        {activeTab === 'next-steps' && <NextSteps />}
        {activeTab === 'how-to' && <HowTo />}
        {activeTab === 'support' && <Support />}
        {activeTab === 'privacy' && <PrivacyPolicy />}
        {activeTab === 'chat' && <Chat />}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500 font-jp-normal">
            <p>© 2025 一般社団法人NAMIDAサポート協会</p>
            <p className="text-xs mt-1">
              テープ式心理学による心の健康サポート
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;