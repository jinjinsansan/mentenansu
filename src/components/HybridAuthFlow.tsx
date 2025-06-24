import React, { useState, useEffect } from 'react';
import { Shield, Mail, Key, Smartphone, CheckCircle, AlertTriangle, ArrowRight, RotateCcw, Settings } from 'lucide-react';
import { hybridAuth, type UserProfile } from '../lib/hybridAuth';
import { emailService } from '../lib/emailService';

interface HybridAuthFlowProps {
  onAuthSuccess: (profile: UserProfile) => void;
  onAuthSkip?: () => void;
}

type AuthStep = 'device' | 'email' | 'verification' | 'passphrase' | 'username' | 'recovery';

const HybridAuthFlow: React.FC<HybridAuthFlowProps> = ({ onAuthSuccess, onAuthSkip }) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('device');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // フォームデータ
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [username, setUsername] = useState('');
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  // 復旧モード
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPassphrase, setRecoveryPassphrase] = useState('');
  const [emailConfig, setEmailConfig] = useState(emailService.getConfigStatus());

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    setLoading(true);
    try {
      const loginResult = await hybridAuth.login();
      
      if (loginResult.success && loginResult.profile) {
        onAuthSuccess(loginResult.profile);
        return;
      }

      if (loginResult.requiresSetup) {
        const { deviceId: newDeviceId, isNewDevice: newDevice } = await hybridAuth.authenticateDevice();
        setDeviceId(newDeviceId);
        setIsNewDevice(newDevice);
        
        if (newDevice) {
          setCurrentStep('email');
        } else {
          setCurrentStep('recovery');
        }
      }
    } catch (error) {
      console.error('認証チェックエラー:', error);
      setError('認証の確認中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await hybridAuth.requestEmailVerification(email);
      
      if (result.success) {
        setSuccess(result.message);
        setCurrentStep('verification');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('メール送信中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await hybridAuth.verifyEmailCode(email, verificationCode);
      
      if (result.success) {
        setSuccess(result.message);
        setCurrentStep('passphrase');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('確認コードの検証中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handlePassphraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await hybridAuth.setPassphrase(passphrase);
      
      if (result.success) {
        setSuccess(result.message);
        setCurrentStep('username');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('合言葉の設定中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const profile = await hybridAuth.createUserProfile(username, email, deviceId);
      setSuccess('アカウントが作成されました！');
      
      setTimeout(() => {
        onAuthSuccess(profile);
      }, 1000);
    } catch (error) {
      setError('アカウント作成中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!email.trim()) {
      setError('メールアドレスを入力してください。');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await emailService.testEmail(email);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('テストメール送信に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || !recoveryPassphrase.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await hybridAuth.recoverAccount(recoveryEmail, recoveryPassphrase);
      
      if (result.success) {
        setEmail(recoveryEmail);
        setSuccess(result.message);
        setCurrentStep('verification');
        setIsRecoveryMode(false);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('アカウント復旧中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceStep = () => (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
        <Smartphone className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-jp-bold text-gray-900 mb-4">デバイス認証</h2>
      <p className="text-gray-600 font-jp-normal mb-6">
        お使いのデバイスを認証しています...
      </p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>
  );

  const renderEmailStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">メールアドレス認証</h2>
        <p className="text-gray-600 font-jp-normal">
          確認コード送信のためのメールアドレスを入力してください
        </p>
        
        {/* EmailJS設定状態表示 */}
        <div className={`mt-4 p-3 rounded-lg border ${
          emailConfig.isConfigured 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Settings className={`w-4 h-4 ${
              emailConfig.isConfigured ? 'text-green-600' : 'text-yellow-600'
            }`} />
            <span className={`text-sm font-jp-medium ${
              emailConfig.isConfigured ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {emailConfig.isConfigured 
                ? 'EmailJS設定済み - 実際のメールが送信されます' 
                : 'EmailJS未設定 - デモモードで動作します'
              }
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-jp-normal"
            placeholder="your@email.com"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>確認コードを送信</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        
        {/* テスト送信ボタン */}
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={loading || !email.trim()}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-jp-medium transition-colors text-sm"
          >
            テスト送信
          </button>
        )}
      </form>
    </div>
  );

  const renderVerificationStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">確認コード入力</h2>
        <p className="text-gray-600 font-jp-normal">
          {email} に送信された4桁の確認コードを入力してください
        </p>
      </div>

      <form onSubmit={handleVerificationSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            確認コード（4桁）
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-center text-2xl tracking-widest"
            placeholder="1234"
            maxLength={4}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || verificationCode.length !== 4}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>確認</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep('email')}
          className="w-full text-gray-600 hover:text-gray-800 py-2 font-jp-normal text-sm transition-colors"
        >
          メールアドレスを変更
        </button>
      </form>
    </div>
  );

  const renderPassphraseStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Key className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">合言葉設定</h2>
        <p className="text-gray-600 font-jp-normal">
          デバイス変更時の本人確認用の合言葉を設定してください
        </p>
      </div>

      <form onSubmit={handlePassphraseSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            合言葉（3〜50文字）
          </label>
          <input
            type="text"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-jp-normal"
            placeholder="覚えやすい単語やフレーズ"
            minLength={3}
            maxLength={50}
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            例：好きな食べ物、ペットの名前、思い出の場所など
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || passphrase.length < 3}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>合言葉を設定</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderUsernameStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">ユーザー名設定</h2>
        <p className="text-gray-600 font-jp-normal">
          最後にユーザー名を設定してアカウント作成を完了します
        </p>
      </div>

      <form onSubmit={handleUsernameSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            ユーザー名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-jp-normal"
            placeholder="あなたの名前"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>アカウント作成完了</span>
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderRecoveryStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <RotateCcw className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">アカウント復旧</h2>
        <p className="text-gray-600 font-jp-normal">
          デバイスが変更されています。アカウントを復旧するには、メールアドレスと合言葉を入力してください
        </p>
      </div>

      <form onSubmit={handleRecoverySubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-jp-normal"
            placeholder="登録したメールアドレス"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-jp-medium text-gray-700 mb-2">
            合言葉
          </label>
          <input
            type="text"
            value={recoveryPassphrase}
            onChange={(e) => setRecoveryPassphrase(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-jp-normal"
            placeholder="設定した合言葉"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !recoveryEmail.trim() || !recoveryPassphrase.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-jp-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <span>アカウントを復旧</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setCurrentStep('email');
              setIsRecoveryMode(false);
            }}
            className="text-gray-600 hover:text-gray-800 font-jp-normal text-sm transition-colors"
          >
            新しいアカウントを作成
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* エラー・成功メッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-jp-medium text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-jp-medium text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* ステップコンテンツ */}
        {currentStep === 'device' && renderDeviceStep()}
        {currentStep === 'email' && renderEmailStep()}
        {currentStep === 'verification' && renderVerificationStep()}
        {currentStep === 'passphrase' && renderPassphraseStep()}
        {currentStep === 'username' && renderUsernameStep()}
        {currentStep === 'recovery' && renderRecoveryStep()}

        {/* スキップオプション（開発環境のみ） */}
        {!import.meta.env.PROD && onAuthSkip && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={onAuthSkip}
              className="text-gray-500 hover:text-gray-700 font-jp-normal text-sm transition-colors"
            >
              開発用：認証をスキップ
            </button>
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 font-jp-normal">
            セキュアな3段階認証システム
          </p>
        </div>
      </div>
    </div>
  );
};

export default HybridAuthFlow;