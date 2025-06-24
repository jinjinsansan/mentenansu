import React, { useState, useEffect } from 'react';
import { Shield, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, Trash2, RefreshCw, Mail, Settings, ExternalLink } from 'lucide-react';
import { hybridAuth } from '../lib/hybridAuth';
import { emailService } from '../lib/emailService';

const HybridAuthSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [userProfile, setUserProfile] = useState(hybridAuth.getUserProfile());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailConfig, setEmailConfig] = useState(emailService.getConfigStatus());
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const enabled = localStorage.getItem('hybrid_auth_enabled') === 'true';
    setIsEnabled(enabled);
  }, []);

  const handleToggleAuth = async () => {
    setLoading(true);
    
    if (isEnabled) {
      // 無効化
      localStorage.setItem('hybrid_auth_enabled', 'false');
      setIsEnabled(false);
    } else {
      // 有効化
      localStorage.setItem('hybrid_auth_enabled', 'true');
      setIsEnabled(true);
      
      // ページをリロードして認証フローを開始
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    setLoading(false);
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      setTestResult('送信先メールアドレスを入力してください。');
      return;
    }

    setTestLoading(true);
    setTestResult('');

    try {
      const result = await emailService.testEmail(testEmail);
      setTestResult(result.message);
    } catch (error) {
      setTestResult('テスト送信に失敗しました。');
    } finally {
      setTestLoading(false);
    }
  };

  const handleDeleteAllData = () => {
    if (window.confirm('すべての認証データを削除しますか？この操作は取り消せません。')) {
      hybridAuth.deleteAllData();
      setUserProfile(null);
      setIsEnabled(false);
      setShowDeleteConfirm(false);
      alert('すべてのデータが削除されました。');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full space-y-6 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-jp-bold text-gray-900">ハイブリッド認証システム</h1>
        </div>

        {/* 認証システムの説明 */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-lg font-jp-bold text-blue-900 mb-4">3段階セキュア認証</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-jp-bold">1</span>
              </div>
              <h3 className="font-jp-bold text-gray-900 mb-2">デバイス認証</h3>
              <p className="text-sm text-gray-600 font-jp-normal">
                ブラウザフィンガープリントによる自動デバイス識別
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-jp-bold">2</span>
              </div>
              <h3 className="font-jp-bold text-gray-900 mb-2">メール認証</h3>
              <p className="text-sm text-gray-600 font-jp-normal">
                4桁確認コードによるメールアドレス認証
              </p>
            </div>
            
            <div className="text-center">
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

        {/* 有効/無効切り替え */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-jp-bold text-gray-900 mb-2">ハイブリッド認証システム</h3>
              <p className="text-gray-600 font-jp-normal">
                {isEnabled 
                  ? 'セキュアな3段階認証が有効です' 
                  : '従来のユーザー名認証を使用中です'
                }
              </p>
            </div>
            <button
              onClick={handleToggleAuth}
              disabled={loading}
              className="flex items-center space-x-2 transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              ) : isEnabled ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* EmailJS設定状態 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-jp-bold text-gray-900 mb-4">EmailJS設定状態</h3>
          
          <div className={`p-4 rounded-lg border ${import.meta.env.PROD ? 'hidden' : ''} ${
            emailConfig.isConfigured 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <Mail className={`w-5 h-5 ${
                emailConfig.isConfigured ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <span className={`font-jp-bold ${
                emailConfig.isConfigured ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {emailConfig.isConfigured ? 'EmailJS設定済み' : 'EmailJS未設定'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                {emailConfig.hasServiceId ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className={emailConfig.hasServiceId ? 'text-green-800' : 'text-yellow-800'}>
                  Service ID: {emailConfig.hasServiceId ? '設定済み' : '未設定'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {emailConfig.hasTemplateId ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className={emailConfig.hasTemplateId ? 'text-green-800' : 'text-yellow-800'}>
                  Template ID: {emailConfig.hasTemplateId ? '設定済み' : '未設定'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {emailConfig.hasPublicKey ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className={emailConfig.hasPublicKey ? 'text-green-800' : 'text-yellow-800'}>
                  Public Key: {emailConfig.hasPublicKey ? '設定済み' : '未設定'}
                </span>
              </div>
            </div>
            
            {!emailConfig.isConfigured && (
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-yellow-800 font-jp-normal text-sm mb-3">
                  EmailJSを設定すると実際のメールが送信されます。設定方法：
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-700 ml-4">
                  <li>EmailJSアカウントを作成</li>
                  <li>メールサービスを設定</li>
                  <li>メールテンプレートを作成</li>
                  <li>環境変数を設定</li>
                </ol>
                <a
                  href="https://www.emailjs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>EmailJSサイトへ</span>
                </a>
              </div>
            )}
          </div>
          
          {/* テスト送信 */}
          <div className={`mt-4 pt-4 border-t border-gray-200 ${import.meta.env.PROD ? 'hidden' : ''}`}>
            <h4 className="font-jp-bold text-gray-900 mb-3">テスト送信</h4>
            <div className="flex space-x-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="テスト用メールアドレス"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
              />
              <button
                onClick={handleTestEmail}
                disabled={testLoading || !testEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors flex items-center space-x-2"
              >
                {testLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>テスト送信</span>
              </button>
            </div>
            {testResult && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* 現在の認証状態 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-jp-bold text-gray-900 mb-4">現在の認証状態</h3>
          
          {userProfile ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-jp-medium text-gray-700">認証済み</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-jp-medium text-gray-600">ユーザー名:</span>
                  <p className="font-jp-bold text-gray-900">{userProfile.username}</p>
                </div>
                <div>
                  <span className="text-sm font-jp-medium text-gray-600">メールアドレス:</span>
                  <p className="font-jp-bold text-gray-900">{userProfile.email}</p>
                </div>
                <div>
                  <span className="text-sm font-jp-medium text-gray-600">デバイスID:</span>
                  <p className="font-mono text-sm text-gray-700">{userProfile.deviceId}</p>
                </div>
                <div>
                  <span className="text-sm font-jp-medium text-gray-600">ログイン回数:</span>
                  <p className="font-jp-bold text-gray-900">{userProfile.loginCount}回</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-jp-medium">作成日時:</span>
                    <span className="ml-2">{formatDate(userProfile.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-jp-medium">最終ログイン:</span>
                    <span className="ml-2">{formatDate(userProfile.lastLoginAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-jp-medium text-gray-700">未認証</span>
            </div>
          )}
        </div>

        {/* セキュリティ機能 */}
        <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
          <h3 className="text-lg font-jp-bold text-green-900 mb-4">セキュリティ機能</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-jp-normal text-green-800">ユーザーの一意性を完全保証</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-jp-normal text-green-800">デバイス変更時の安全な復旧機能</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-jp-normal text-green-800">メールアドレス確認による本人認証</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-jp-normal text-green-800">合言葉によるバックアップ認証</span>
            </div>
          </div>
        </div>

        {/* データ削除 */}
        {userProfile && (
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="text-lg font-jp-bold text-red-900 mb-4">データ削除</h3>
            <p className="text-red-800 font-jp-normal mb-4">
              すべての認証データを削除します。この操作は取り消せません。
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>すべてのデータを削除</span>
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-900 font-jp-bold">本当に削除しますか？</p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAllData}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                  >
                    削除する
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-jp-medium transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 font-jp-normal space-y-1">
              <p className="font-jp-medium">重要な注意事項:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ハイブリッド認証を有効にすると、従来のユーザー名認証は無効になります</li>
                <li>メールアドレスと合言葉は安全に保管してください</li>
                <li>デバイス変更時は、メールアドレスと合言葉が必要です</li>
                <li>データ削除後は復旧できません</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridAuthSettings;