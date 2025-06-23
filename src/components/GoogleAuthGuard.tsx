import React, { useState, useEffect } from 'react';
import { Shield, User, LogOut } from 'lucide-react';
import { checkGoogleAuthStatus, logoutFromGoogle, type GoogleUserProfile } from '../lib/googleAuth';
import GoogleLogin from '../pages/GoogleLogin';

interface GoogleAuthGuardProps {
  children: React.ReactNode;
}

const GoogleAuthGuard: React.FC<GoogleAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLogin, setShowLogin] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setLoading(true);
    const authStatus = checkGoogleAuthStatus();
    setIsAuthenticated(authStatus.isAuthenticated);
    setUser(authStatus.user);
    setLoading(false);
  };

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logoutFromGoogle();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleBackFromLogin = () => {
    setShowLogin(false);
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

  if (showLogin) {
    return <GoogleLogin onBack={handleBackFromLogin} />;
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
            <p className="text-gray-600 font-jp-normal">
              安全にご利用いただくため、Googleアカウントでのログインが必要です
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h3 className="font-jp-bold text-blue-900 mb-3">🔐 セキュリティ強化</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• ユーザーの一意性を保証</p>
              <p>• 不正アクセスを防止</p>
              <p>• データの安全性を確保</p>
              <p>• PKCE対応のセキュアな認証</p>
            </div>
          </div>

          <button
            onClick={handleShowLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg mb-4"
          >
            Googleでログイン
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              ログインすることで、プライバシーポリシーに同意したものとみなします
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
              {user?.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-jp-medium text-gray-900">
                {user?.name || 'Googleユーザー'}
              </p>
              <p className="text-xs text-gray-500">Google認証済み</p>
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

export default GoogleAuthGuard;