import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import HybridAuthFlow from '../components/HybridAuthFlow';
import { hybridAuth, type UserProfile } from '../lib/hybridAuth';
import HybridAuthSettings from '../components/HybridAuthSettings';
import { useMaintenanceStatus } from '../hooks/useMaintenanceStatus';

const HybridAuthPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { isMaintenanceMode, config: maintenanceConfig } = useMaintenanceStatus();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const isAuth = hybridAuth.isAuthenticated();
      const profile = hybridAuth.getUserProfile();
      
      setIsAuthenticated(isAuth);
      setUserProfile(profile);
      
      if (!isAuth) {
        setShowAuthFlow(true);
      }
    } catch (error) {
      console.error('認証状態確認エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
    setShowAuthFlow(false);
  };

  const handleAuthSkip = () => {
    // 開発環境でのスキップ処理
    const tempProfile: UserProfile = {
      deviceId: 'dev-device',
      email: 'dev@example.com',
      isEmailVerified: true,
      username: 'デベロッパー',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      loginCount: 1
    };
    
    localStorage.setItem('line-username', tempProfile.username);
    handleAuthSuccess(tempProfile);
  };

  const handleLogout = () => {
    hybridAuth.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setShowAuthFlow(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // メンテナンスモード中は認証を表示しない
  if (isMaintenanceMode && maintenanceConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-jp-normal">メンテナンス中のため認証システムは一時的に無効化されています...</p>
        </div>
      </div>
    );
  }

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

  if (showAuthFlow) {
    return (
      <HybridAuthFlow
        onAuthSuccess={handleAuthSuccess}
        onAuthSkip={import.meta.env.PROD ? undefined : handleAuthSkip}
      />
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-jp-bold text-gray-900">認証設定</h1>
                  <p className="text-gray-600 font-jp-normal">セキュリティ設定を管理します</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                戻る
              </button>
            </div>
          </div>
          
          <HybridAuthSettings />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-jp-bold text-gray-900">認証完了</h1>
                <p className="text-gray-600 font-jp-normal">セキュアな認証システムでログイン中</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                設定
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* ユーザー情報 */}
        {userProfile && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-jp-bold text-gray-900 mb-4">ユーザー情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-jp-medium text-gray-700">ユーザー名</span>
                </div>
                <p className="text-lg font-jp-bold text-blue-900">{userProfile.username}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-jp-medium text-gray-700">メールアドレス</span>
                </div>
                <p className="text-lg font-jp-bold text-green-900">{userProfile.email}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="font-jp-medium text-gray-700">デバイスID</span>
                </div>
                <p className="text-sm font-mono text-purple-900">{userProfile.deviceId}</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <span className="font-jp-medium text-gray-700">ログイン回数</span>
                </div>
                <p className="text-lg font-jp-bold text-orange-900">{userProfile.loginCount}回</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-jp-medium">アカウント作成:</span>
                  <span className="ml-2">{formatDate(userProfile.createdAt)}</span>
                </div>
                <div>
                  <span className="font-jp-medium">最終ログイン:</span>
                  <span className="ml-2">{formatDate(userProfile.lastLoginAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* セキュリティ情報 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-jp-bold text-gray-900 mb-4">セキュリティ機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-jp-bold">1</span>
              </div>
              <h3 className="font-jp-bold text-gray-900 mb-2">デバイス認証</h3>
              <p className="text-sm text-gray-600 font-jp-normal">
                ブラウザフィンガープリントによる自動デバイス識別
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-jp-bold">2</span>
              </div>
              <h3 className="font-jp-bold text-gray-900 mb-2">メール認証</h3>
              <p className="text-sm text-gray-600 font-jp-normal">
                4桁確認コードによるメールアドレス認証
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-jp-bold">3</span>
              </div>
              <h3 className="font-jp-bold text-gray-900 mb-2">合言葉認証</h3>
              <p className="text-sm text-gray-600 font-jp-normal">
                デバイス変更時のバックアップ認証
              </p>
            </div>
          </div>
        </div>

        {/* 開発者情報（開発環境のみ） */}
        {import.meta.env.DEV && (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6 mt-6">
            <h2 className="text-lg font-jp-bold text-yellow-900 mb-4">開発者情報</h2>
            <pre className="text-xs text-yellow-800 font-mono bg-yellow-100 p-3 rounded overflow-auto">
              {JSON.stringify(hybridAuth.getDebugInfo(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridAuthPage;