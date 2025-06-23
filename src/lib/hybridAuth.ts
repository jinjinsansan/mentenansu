// ハイブリッド認証システム
// 第一段階：ブラウザフィンガープリント
// 第二段階：メールアドレス認証
// 第三段階：バックアップ認証（合言葉）

import { emailService } from './emailService';

import { emailService } from './emailService';

interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  colorDepth: number;
  pixelRatio: number;
}

interface UserProfile {
  deviceId: string;
  email?: string;
  isEmailVerified: boolean;
  passphrase?: string;
  username: string;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

interface VerificationCode {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

class HybridAuthSystem {
  private static instance: HybridAuthSystem;
  private verificationCodes: Map<string, VerificationCode> = new Map();

  static getInstance(): HybridAuthSystem {
    if (!HybridAuthSystem.instance) {
      HybridAuthSystem.instance = new HybridAuthSystem();
    }
    return HybridAuthSystem.instance;
  }

  // 第一段階：ブラウザフィンガープリント生成
  generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint: DeviceFingerprint = {
      id: '',
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };

    // フィンガープリントからハッシュを生成
    const fingerprintString = JSON.stringify(fingerprint) + canvasFingerprint;
    fingerprint.id = this.generateHash(fingerprintString);

    return fingerprint;
  }

  // ハッシュ生成（簡易版）
  private generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(36);
  }

  // 第一段階：デバイス認証
  async authenticateDevice(): Promise<{ deviceId: string; isNewDevice: boolean }> {
    const fingerprint = this.generateDeviceFingerprint();
    const deviceId = fingerprint.id;
    
    // ローカルストレージでデバイス情報を確認
    const savedDeviceId = localStorage.getItem('device_id');
    const isNewDevice = !savedDeviceId || savedDeviceId !== deviceId;
    
    if (isNewDevice) {
      localStorage.setItem('device_id', deviceId);
      localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
      localStorage.setItem('device_registered_at', new Date().toISOString());
    }

    return { deviceId, isNewDevice };
  }

  // 第二段階：メールアドレス認証
  async requestEmailVerification(email: string): Promise<{ success: boolean; message: string }> {
    // メールアドレスの形式チェック
    if (!emailRegex.test(email)) {
      return { success: false, message: 'メールアドレスの形式が正しくありません' };
    }

    // 4桁の確認コードを生成
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10分後に期限切れ

    // 確認コードを保存
    this.verificationCodes.set(email, {
      code,
      email,
      expiresAt,
      attempts: 0
    });

    // EmailJSを使用してメール送信
    // EmailJSを使用してメール送信
    try {
      const result = await emailService.sendVerificationEmail(email, code);
      return result;
    } catch (error) {
      console.error('メール送信エラー:', error);
  }

  // 確認コードの検証
  async verifyEmailCode(email: string, inputCode: string): Promise<{ success: boolean; message: string }> {
    const verification = this.verificationCodes.get(email);
    
    if (!verification) {
      return { success: false, message: '確認コードが見つかりません。再度リクエストしてください。' };
    }

    // 試行回数チェック
    if (verification.attempts >= 3) {
      this.verificationCodes.delete(email);
      return { success: false, message: '試行回数が上限に達しました。再度リクエストしてください。' };
    }

    // 期限チェック
    if (Date.now() > verification.expiresAt) {
      this.verificationCodes.delete(email);
      return { success: false, message: '確認コードの有効期限が切れています。再度リクエストしてください。' };
    }

    // コード検証
    verification.attempts++;
    
    if (verification.code !== inputCode) {
      return { 
        success: false, 
        message: `確認コードが正しくありません。残り試行回数: ${3 - verification.attempts}回` 
      };
    }

    // 検証成功
    this.verificationCodes.delete(email);
    return { success: true, message: 'メールアドレスが確認されました。' };
  }

  // 第三段階：合言葉設定
  async setPassphrase(passphrase: string): Promise<{ success: boolean; message: string }> {
    if (passphrase.length < 3) {
      return { success: false, message: '合言葉は3文字以上で設定してください。' };
    }

    if (passphrase.length > 50) {
      return { success: false, message: '合言葉は50文字以内で設定してください。' };
    }

    // 合言葉をハッシュ化して保存
    const hashedPassphrase = this.generateHash(passphrase.toLowerCase());
    localStorage.setItem('user_passphrase', hashedPassphrase);
    localStorage.setItem('passphrase_set_at', new Date().toISOString());

    return { success: true, message: '合言葉が設定されました。' };
  }

  // 合言葉による認証
  async verifyPassphrase(inputPassphrase: string): Promise<{ success: boolean; message: string }> {
    const savedPassphrase = localStorage.getItem('user_passphrase');
    
    if (!savedPassphrase) {
      return { success: false, message: '合言葉が設定されていません。' };
    }

    const hashedInput = this.generateHash(inputPassphrase.toLowerCase());
    
    if (hashedInput !== savedPassphrase) {
      return { success: false, message: '合言葉が正しくありません。' };
    }

    return { success: true, message: '合言葉が確認されました。' };
  }

  // ユーザープロファイルの作成
  async createUserProfile(username: string, email: string, deviceId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      deviceId,
      email,
      isEmailVerified: true,
      username,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      loginCount: 1
    };

    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('line-username', username); // 既存システムとの互換性
    
    return profile;
  }

  // ユーザープロファイルの取得
  getUserProfile(): UserProfile | null {
    const profileData = localStorage.getItem('user_profile');
    if (!profileData) return null;
    
    try {
      return JSON.parse(profileData);
    } catch {
      return null;
    }
  }

  // ログイン処理
  async login(): Promise<{ success: boolean; profile: UserProfile | null; requiresSetup: boolean }> {
    const { deviceId, isNewDevice } = await this.authenticateDevice();
    
    if (isNewDevice) {
      return { success: false, profile: null, requiresSetup: true };
    }

    const profile = this.getUserProfile();
    if (!profile) {
      return { success: false, profile: null, requiresSetup: true };
    }

    // ログイン回数を更新
    profile.loginCount++;
    profile.lastLoginAt = new Date().toISOString();
    localStorage.setItem('user_profile', JSON.stringify(profile));

    return { success: true, profile, requiresSetup: false };
  }

  // デバイス変更時の復旧処理
  async recoverAccount(email: string, passphrase: string): Promise<{ success: boolean; message: string }> {
    // メール認証
    const emailResult = await this.requestEmailVerification(email);
    if (!emailResult.success) {
      return emailResult;
    }

    // 合言葉確認（実際の実装では、サーバーサイドで確認）
    const passphraseResult = await this.verifyPassphrase(passphrase);
    if (!passphraseResult.success) {
      return { success: false, message: '合言葉が正しくありません。アカウントを復旧できません。' };
    }

    return { success: true, message: 'アカウントの復旧が可能です。確認コードを入力してください。' };
  }

  // ログアウト
  logout(): void {
    // セッション情報のみクリア（デバイス情報は保持）
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_passphrase');
    localStorage.removeItem('line-username');
  }

  // 完全なデータ削除（アカウント削除時）
  deleteAllData(): void {
    const keysToDelete = [
      'device_id',
      'device_fingerprint', 
      'device_registered_at',
      'user_profile',
      'user_passphrase',
      'passphrase_set_at',
      'line-username',
      'journalEntries',
      'consent_histories',
      'privacyConsentGiven',
      'privacyConsentDate',
      'initialScores'
    ];

    keysToDelete.forEach(key => localStorage.removeItem(key));
    this.verificationCodes.clear();
  }

  // 認証状態の確認
  isAuthenticated(): boolean {
    const profile = this.getUserProfile();
    const deviceId = localStorage.getItem('device_id');
    
    return !!(profile && deviceId && profile.deviceId === deviceId);
  }

  // デバッグ情報（開発環境のみ）
  getDebugInfo(): any {
    if (!import.meta.env.DEV) return null;
    
    return {
      deviceId: localStorage.getItem('device_id'),
      hasProfile: !!this.getUserProfile(),
      hasPassphrase: !!localStorage.getItem('user_passphrase'),
      isAuthenticated: this.isAuthenticated(),
      verificationCodesCount: this.verificationCodes.size
    };
  }
}

export const hybridAuth = HybridAuthSystem.getInstance();
export type { DeviceFingerprint, UserProfile, VerificationCode };