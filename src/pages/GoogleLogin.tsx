import React, { useEffect } from 'react';
import { Shield, ExternalLink, ArrowLeft } from 'lucide-react';
import { generateGoogleLoginUrl, checkGoogleAuthStatus } from '../lib/googleAuth';

interface GoogleLoginProps {
  onBack: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onBack }) => {
  useEffect(() => {
    // 既にログイン済みの場合はリダイレクト
    const { isAuthenticated } = checkGoogleAuthStatus();
    if (isAuthenticated) {
      onBack();
    }
  }, [onBack]);

  const handleGoogleLogin = async () => {
    try {
      const loginUrl = await generateGoogleLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Google Login URL生成エラー:', error);
      alert('ログインURLの生成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
            安全なログイン
          </h1>
          <p className="text-gray-600 font-jp-normal">
            Googleアカウントで安全にログインします
          </p>
        </div>

        {/* セキュリティ説明 */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
          <h3 className="font-jp-bold text-blue-900 mb-3">🔒 セキュリティ機能</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Google公式の認証システムを使用</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>PKCE対応のセキュアな認証フロー</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>CSRF・リプレイ攻撃対策済み</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>暗号化された安全な通信</span>
            </div>
          </div>
        </div>

        {/* ログインの流れ */}
        <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
          <h3 className="font-jp-bold text-green-900 mb-3">📱 ログインの流れ</h3>
          <div className="space-y-3 text-sm text-green-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-jp-bold flex-shrink-0">1</div>
              <span>Googleの認証画面に移動</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-jp-bold flex-shrink-0">2</div>
              <span>Googleアカウントでログイン</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-jp-bold flex-shrink-0">3</div>
              <span>アプリに自動で戻る</span>
            </div>
          </div>
        </div>

        {/* ログインボタン */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-jp-bold transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2 mb-4"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Googleでログイン</span>
        </button>

        {/* 戻るボタン */}
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>戻る</span>
        </button>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-xs text-yellow-800 font-jp-normal">
            <p className="font-jp-medium mb-1">⚠️ 重要</p>
            <p>ログインには有効なGoogleアカウントが必要です。認証後、メールアドレスがユーザー識別子として使用されます。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;