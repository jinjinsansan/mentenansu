import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { exchangeCodeForToken, getLineUserProfile, saveAuthData } from '../lib/lineAuth';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('認証処理中...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // エラーチェック
        if (error) {
          throw new Error(`認証エラー: ${errorDescription || error}`);
        }

        if (!code || !state) {
          throw new Error('認証パラメータが不正です');
        }

        setMessage('アクセストークンを取得中...');
        
        // 認証コードをアクセストークンに交換
        const tokenData = await exchangeCodeForToken(code, state);
        
        setMessage('ユーザー情報を取得中...');
        
        // ユーザープロフィールを取得
        const userProfile = await getLineUserProfile(tokenData.access_token);
        
        setMessage('認証情報を保存中...');
        
        // 認証情報を安全に保存
        await saveAuthData(tokenData, userProfile);
        
        setStatus('success');
        setMessage('ログインが完了しました！');
        
        // 2秒後にメインページにリダイレクト
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
      } catch (error) {
        console.error('認証エラー:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '認証に失敗しました');
        
        // 5秒後にホームページにリダイレクト
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      }
    };

    handleCallback();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'processing':
        return 'from-blue-50 to-indigo-100';
      case 'success':
        return 'from-green-50 to-emerald-100';
      case 'error':
        return 'from-red-50 to-pink-100';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundColor()} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-gray-600" />
          </div>
          
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-4">
            LINE認証
          </h1>
          
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <p className={`font-jp-medium mb-6 ${getStatusColor()}`}>
            {message}
          </p>
          
          {status === 'processing' && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 font-jp-normal">
                しばらくお待ちください...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-800 font-jp-normal">
                まもなくメインページに移動します
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-800 font-jp-normal mb-3">
                認証に失敗しました。もう一度お試しください。
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;