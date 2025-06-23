import React, { useState, useEffect } from 'react';
import { Shield, User, LogOut, X } from 'lucide-react';
import { checkAuthStatus, logoutFromLine, type LineUser } from '../lib/lineAuth';
import LineLogin from '../pages/LineLogin';

interface LineAuthGuardProps {
  children: React.ReactNode;
  showLineLogin?: boolean;
  onCloseLineLogin?: () => void;
}

const LineAuthGuard: React.FC<LineAuthGuardProps> = ({ children, showLineLogin = false, onCloseLineLogin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<LineUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [internalShowLogin, setInternalShowLogin] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setLoading(true);
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus.isAuthenticated);
    setUser(authStatus.user);
    setLoading(false);
  };

  // 外部からのログイン表示制御
  useEffect(() => {
    if (showLineLogin) {
      setInternalShowLogin(true);
    }
  }, [showLineLogin]);

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logoutFromLine();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleShowLogin = () => {
    setInternalShowLogin(true);
  };

  const handleBackFromLogin = () => {
    setInternalShowLogin(false);
    if (onCloseLineLogin) {
      onCloseLineLogin();
    }
    checkAuth(); // ログイン状態を再確認
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-jp-normal">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  if (internalShowLogin) {
    return <LineLogin onBack={handleBackFromLogin} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
              ログインが必要です
            </h1>
            <p className="text-gray-600 font-jp-normal mb-4">
              より安全にご利用いただくため、LINEアカウントでのログインをお勧めします
            </p>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-blue-800 font-jp-normal text-sm">
                ※ LINE認証なしでも基本機能はご利用いただけますが、データの安全性向上のためLINE認証をお勧めします。
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h3 className="font-jp-bold text-blue-900 mb-3">🔐 セキュリティ強化</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• ユーザーの一意性を保証</p>
              <p>• 不正アクセスを防止</p>
              <p>• データの安全性を確保</p>
            </div>
          </div>

          <button
            onClick={handleShowLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg mb-4"
          >
            LINEでログイン
          </button>

          <button
            onClick={() => {
              // LINE認証をスキップして通常のアプリを使用
              setIsAuthenticated(true);
              if (onCloseLineLogin) {
                onCloseLineLogin();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors mb-4"
          >
            <X className="w-4 h-4" />
            <span>LINE認証をスキップ</span>
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              ログインすることで、プライバシーポリシーに同意したものとみなします
            </p>
            <p className="text-xs text-gray-400">
              LINE認証をスキップした場合も、基本的なプライバシー保護は適用されます
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 認証済みの場合、ユーザー情報を表示するヘッダーを追加
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 認証済みユーザー情報ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-jp-medium text-gray-900">
                {user?.displayName || 'LINEユーザー'}
              </p>
              <p className="text-xs text-gray-500">認証済み</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default LineAuthGuard;