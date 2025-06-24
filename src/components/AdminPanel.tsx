import React, { useState, useEffect } from 'react';
import { X, Users, Search, Calendar, MessageCircle, Settings, Database, Shield, Activity } from 'lucide-react';
import AdvancedSearchFilter from './AdvancedSearchFilter';
import CounselorManagement from './CounselorManagement';
import CounselorChat from './CounselorChat';
import DataMigration from './DataMigration';
import ConsentHistoryManagement from './ConsentHistoryManagement';
import DeviceAuthManagement from './DeviceAuthManagement';
import SecurityDashboard from './SecurityDashboard';
import MaintenanceController from './MaintenanceController';

interface AdminPanelProps {
  onClose: () => void;
}

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  selfEsteemScore?: number;
  worthlessnessScore?: number;
  created_at: string;
  user?: {
    line_username: string;
  };
  assigned_counselor?: string;
  urgency_level?: 'high' | 'medium' | 'low';
  counselor_memo?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('entries');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);

  const counselors = [
    { name: '仁カウンセラー', email: 'jin@namisapo.com' },
    { name: 'AOIカウンセラー', email: 'aoi@namisapo.com' },
    { name: 'あさみカウンセラー', email: 'asami@namisapo.com' },
    { name: 'SHUカウンセラー', email: 'shu@namisapo.com' },
    { name: 'ゆーちゃカウンセラー', email: 'yucha@namisapo.com' },
    { name: 'sammyカウンセラー', email: 'sammy@namisapo.com' }
  ];

  useEffect(() => {
    // 既にログイン済みかチェック
    const savedAuth = localStorage.getItem('counselor-auth');
    if (savedAuth) {
      setIsAuthenticated(true);
      loadEntries();
    }
  }, []);

  const loadEntries = () => {
    try {
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries);
        const entriesWithUserInfo = parsedEntries.map((entry: any) => ({
          ...entry,
          created_at: entry.date,
          user: {
            line_username: localStorage.getItem('line-username') || 'ユーザー'
          }
        }));
        setEntries(entriesWithUserInfo);
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const counselor = counselors.find(c => c.email === loginForm.email);
    
    if (counselor && loginForm.password === 'counselor123') {
      setIsAuthenticated(true);
      localStorage.setItem('counselor-auth', JSON.stringify({
        email: loginForm.email,
        name: counselor.name,
        loginTime: new Date().toISOString()
      }));
      loadEntries();
    } else {
      setLoginError('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('counselor-auth');
    setLoginForm({ email: '', password: '' });
    onClose();
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  const tabs = [
    { id: 'entries', label: '日記管理', icon: Search },
    { id: 'counselors', label: 'カウンセラー', icon: Users },
    { id: 'chat', label: 'チャット', icon: MessageCircle },
    { id: 'data', label: 'データ管理', icon: Database },
    { id: 'device-auth', label: 'デバイス認証', icon: Shield },
    { id: 'security', label: 'セキュリティ', icon: Activity },
    { id: 'maintenance', label: 'メンテナンス', icon: Settings }
  ];

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-jp-bold text-gray-900">カウンセラーログイン</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                  placeholder="例: jin@namisapo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
                  placeholder="パスワードを入力"
                  required
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-jp-normal">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                ログイン
              </button>
            </form>

            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-jp-bold text-blue-900 mb-2">テスト用アカウント</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>メール: jin@namisapo.com</p>
                <p>パスワード: counselor123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'entries':
        return (
          <AdvancedSearchFilter
            entries={entries}
            onFilteredResults={() => {}}
            onViewEntry={handleViewEntry}
          />
        );
      case 'counselors':
        return <ConsentHistoryManagement />;
      case 'chat':
        return <CounselorChat />;
      case 'data':
        return <DataMigration />;
      case 'device-auth':
        return <DeviceAuthManagement />;
      case 'security':
        return <SecurityDashboard />;
      case 'maintenance':
        return <MaintenanceController />;
      default:
        return <div>選択されたタブの内容</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-jp-bold text-gray-900">カウンセラー管理画面</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-jp-normal">
              {JSON.parse(localStorage.getItem('counselor-auth') || '{}').name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-jp-medium"
            >
              ログアウト
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-jp-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="flex-1 overflow-auto p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* 日記詳細モーダル */}
      {showEntryModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-jp-bold text-gray-900">日記詳細</h2>
                <button
                  onClick={() => setShowEntryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 font-jp-medium">
                    {new Date(selectedEntry.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900 font-jp-medium">
                    {selectedEntry.user?.line_username || 'Unknown User'}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-jp-semibold text-gray-900 mb-2">感情</h3>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-jp-medium">
                    {selectedEntry.emotion}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-jp-semibold text-gray-900 mb-2">出来事</h3>
                  <p className="text-gray-700 font-jp-normal whitespace-pre-wrap">
                    {selectedEntry.event}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-jp-semibold text-gray-900 mb-2">気づき</h3>
                  <p className="text-gray-700 font-jp-normal whitespace-pre-wrap">
                    {selectedEntry.realization}
                  </p>
                </div>

                {selectedEntry.emotion === '無価値感' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-jp-semibold text-gray-900 mb-2">スコア</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">自己肯定感</p>
                        <p className="text-xl font-jp-bold text-blue-600">
                          {selectedEntry.selfEsteemScore || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">無価値感</p>
                        <p className="text-xl font-jp-bold text-red-600">
                          {selectedEntry.worthlessnessScore || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;