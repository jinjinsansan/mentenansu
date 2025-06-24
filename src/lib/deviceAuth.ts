// デバイス認証システム
export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
  placeholder?: string;
}

export interface AuthSession {
  lineUsername: string;
  pinCode: string;
  deviceId: string;
  lastActivity: string;
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  timestamp: string;
}

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  DEVICE_NOT_RECOGNIZED = 'DEVICE_NOT_RECOGNIZED',
  SECURITY_QUESTION_FAILED = 'SECURITY_QUESTION_FAILED'
}

export class AuthError extends Error {
  constructor(public type: AuthErrorType, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const STORAGE_KEYS = {
  DEVICE_FINGERPRINT: 'device_fingerprint',
  USER_CREDENTIALS: 'user_credentials',
  AUTH_SESSION: 'auth_session',
  SECURITY_QUESTIONS: 'security_questions',
  LOGIN_ATTEMPTS: 'login_attempts',
  ACCOUNT_LOCKED: 'account_locked'
};

export const SECURITY_QUESTIONS = [
  {
    id: 'pet_name',
    question: '初めて飼ったペットの名前は？',
    placeholder: '例：ポチ'
  },
  {
    id: 'birth_place',
    question: '生まれた場所（市区町村）は？',
    placeholder: '例：東京都渋谷区'
  },
  {
    id: 'school_name',
    question: '小学校の名前は？',
    placeholder: '例：○○小学校'
  },
  {
    id: 'favorite_food',
    question: '子供の頃の好きな食べ物は？',
    placeholder: '例：カレーライス'
  },
  {
    id: 'mother_maiden',
    question: '母親の旧姓は？',
    placeholder: '例：田中'
  }
];

// デバイスフィンガープリント生成
export const generateDeviceFingerprint = (): DeviceFingerprint => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 10, 10);
  const canvasFingerprint = canvas.toDataURL();

  const fingerprint = {
    id: btoa(canvasFingerprint + navigator.userAgent + screen.width + screen.height).slice(0, 32),
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    timestamp: new Date().toISOString()
  };

  return fingerprint;
};

// デバイスフィンガープリント保存
export const saveDeviceFingerprint = (fingerprint: DeviceFingerprint): void => {
  localStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, JSON.stringify(fingerprint));
};

// デバイスフィンガープリント取得
export const getDeviceFingerprint = (): DeviceFingerprint | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_FINGERPRINT);
  return stored ? JSON.parse(stored) : null;
};

// デバイスフィンガープリント比較
export const compareDeviceFingerprints = (current: DeviceFingerprint, stored: DeviceFingerprint): boolean => {
  return current.id === stored.id;
};

// PIN番号ハッシュ化
export const hashPinCode = async (pinCode: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pinCode + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ユーザー認証情報保存
export const saveUserCredentials = async (lineUsername: string, pinCode: string, deviceId: string): Promise<void> => {
  const salt = crypto.getRandomValues(new Uint8Array(16)).toString();
  const pinCodeHash = await hashPinCode(pinCode, salt);
  
  const credentials = {
    lineUsername,
    pinCodeHash,
    salt,
    deviceId,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
};

// ユーザー認証情報取得
export const getUserCredentials = (): any => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
  return stored ? JSON.parse(stored) : null;
};

// 認証セッション作成
export const createAuthSession = (session: AuthSession): void => {
  const sessionData = {
    ...session,
    lastActivity: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
};

// 認証セッション取得
export const getAuthSession = (): AuthSession | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  return stored ? JSON.parse(stored) : null;
};

// 現在のユーザー取得
export const getCurrentUser = (): { lineUsername: string } | null => {
  const session = getAuthSession();
  if (session) {
    return { lineUsername: session.lineUsername };
  }
  
  const lineUsername = localStorage.getItem('line-username');
  if (lineUsername) {
    return { lineUsername };
  }
  
  return null;
};

// セキュリティ質問保存
export const saveSecurityQuestions = (questions: SecurityQuestion[]): void => {
  const encoded = questions.map(q => ({
    ...q,
    answer: btoa(q.answer.toLowerCase().trim())
  }));
  localStorage.setItem(STORAGE_KEYS.SECURITY_QUESTIONS, JSON.stringify(encoded));
};

// セキュリティ質問取得
export const getSecurityQuestions = (): SecurityQuestion[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SECURITY_QUESTIONS);
  return stored ? JSON.parse(stored) : [];
};

// ログイン試行回数管理
export const getLoginAttempts = (username: string): number => {
  const stored = localStorage.getItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}_${username}`);
  return stored ? parseInt(stored) : 0;
};

export const incrementLoginAttempts = (username: string): number => {
  const current = getLoginAttempts(username);
  const newCount = current + 1;
  localStorage.setItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}_${username}`, newCount.toString());
  
  if (newCount >= 5) {
    lockAccount(username);
  }
  
  return newCount;
};

export const resetLoginAttempts = (username: string): void => {
  localStorage.removeItem(`${STORAGE_KEYS.LOGIN_ATTEMPTS}_${username}`);
};

// アカウントロック管理
export const lockAccount = (username: string): void => {
  const lockData = {
    lockedAt: new Date().toISOString(),
    unlockAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_LOCKED}_${username}`, JSON.stringify(lockData));
};

export const isAccountLocked = (username: string): boolean => {
  const stored = localStorage.getItem(`${STORAGE_KEYS.ACCOUNT_LOCKED}_${username}`);
  if (!stored) return false;
  
  const lockData = JSON.parse(stored);
  const unlockTime = new Date(lockData.unlockAt);
  const now = new Date();
  
  if (now >= unlockTime) {
    localStorage.removeItem(`${STORAGE_KEYS.ACCOUNT_LOCKED}_${username}`);
    resetLoginAttempts(username);
    return false;
  }
  
  return true;
};

// ログアウト
export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
};

// セキュリティイベントログ
export const logSecurityEvent = (type: string, username: string, details: string): void => {
  try {
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    const newEvent = {
      id: Date.now().toString(),
      type,
      username,
      timestamp: new Date().toISOString(),
      details
    };
    
    events.push(newEvent);
    
    // 最新100件のみ保持
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('security_events', JSON.stringify(events));
  } catch (error) {
    console.error('セキュリティイベントログエラー:', error);
  }
};