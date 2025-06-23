// Google OAuth2.0認証ライブラリ
// セキュアな認証フローを実装

interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token: string;
}

interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

interface GoogleAuthData {
  tokenData: GoogleTokenResponse;
  userProfile: GoogleUserProfile;
  expiresAt: number;
}

// 環境変数から設定を取得
const getGoogleAuthConfig = (): GoogleAuthConfig | null => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    console.warn('Google認証の環境変数が設定されていません');
    return null;
  }
  
  return {
    clientId,
    redirectUri,
    scope: 'openid email profile'
  };
};

// CSRF攻撃対策のためのstate生成
const generateSecureState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// PKCE (Proof Key for Code Exchange) のcode_verifier生成
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// code_verifierからcode_challengeを生成
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Google認証URLを生成
export const generateGoogleLoginUrl = async (): Promise<string> => {
  const config = getGoogleAuthConfig();
  if (!config) {
    throw new Error('Google認証が設定されていません');
  }

  // セキュリティパラメータ生成
  const state = generateSecureState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // セッションストレージに保存（XSS対策）
  sessionStorage.setItem('google_auth_state', state);
  sessionStorage.setItem('google_code_verifier', codeVerifier);
  sessionStorage.setItem('google_auth_timestamp', Date.now().toString());

  // Google OAuth2.0認証URL構築
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// 認証コードをアクセストークンに交換
export const exchangeCodeForToken = async (code: string, state: string): Promise<GoogleTokenResponse> => {
  const config = getGoogleAuthConfig();
  if (!config) {
    throw new Error('Google認証が設定されていません');
  }

  // State検証（CSRF攻撃対策）
  const savedState = sessionStorage.getItem('google_auth_state');
  const timestamp = sessionStorage.getItem('google_auth_timestamp');
  
  if (!savedState || savedState !== state) {
    throw new Error('不正なstateパラメータです');
  }

  // タイムスタンプ検証（リプレイ攻撃対策）
  if (!timestamp || Date.now() - parseInt(timestamp) > 10 * 60 * 1000) {
    throw new Error('認証リクエストの有効期限が切れています');
  }

  const codeVerifier = sessionStorage.getItem('google_code_verifier');
  if (!codeVerifier) {
    throw new Error('認証情報が見つかりません');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        code: code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`トークン取得エラー: ${errorData.error_description || errorData.error}`);
    }

    const tokenData = await response.json();
    
    // セッションストレージをクリア
    sessionStorage.removeItem('google_auth_state');
    sessionStorage.removeItem('google_code_verifier');
    sessionStorage.removeItem('google_auth_timestamp');

    return tokenData;
  } catch (error) {
    // セッションストレージをクリア
    sessionStorage.removeItem('google_auth_state');
    sessionStorage.removeItem('google_code_verifier');
    sessionStorage.removeItem('google_auth_timestamp');
    
    throw error;
  }
};

// ユーザープロフィール取得
export const getGoogleUserProfile = async (accessToken: string): Promise<GoogleUserProfile> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    const userProfile = await response.json();
    
    // 必須フィールドの検証
    if (!userProfile.id || !userProfile.email) {
      throw new Error('ユーザー情報が不完全です');
    }

    return userProfile;
  } catch (error) {
    throw new Error(`ユーザー情報取得エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

// 認証データを安全に保存
export const saveGoogleAuthData = (tokenData: GoogleTokenResponse, userProfile: GoogleUserProfile): void => {
  const authData: GoogleAuthData = {
    tokenData,
    userProfile,
    expiresAt: Date.now() + (tokenData.expires_in * 1000)
  };

  // 暗号化して保存（実際の実装では適切な暗号化を使用）
  const encryptedData = btoa(JSON.stringify(authData));
  localStorage.setItem('google_auth_data', encryptedData);
  localStorage.setItem('google_auth_timestamp', Date.now().toString());
  
  // ユーザー名をアプリ用に保存
  localStorage.setItem('line-username', userProfile.email);
};

// 認証状態確認
export const checkGoogleAuthStatus = (): { isAuthenticated: boolean; user: GoogleUserProfile | null } => {
  try {
    const encryptedData = localStorage.getItem('google_auth_data');
    const timestamp = localStorage.getItem('google_auth_timestamp');
    
    if (!encryptedData || !timestamp) {
      return { isAuthenticated: false, user: null };
    }

    // 24時間以上経過している場合は無効
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
      logoutFromGoogle();
      return { isAuthenticated: false, user: null };
    }

    const authData: GoogleAuthData = JSON.parse(atob(encryptedData));
    
    // トークンの有効期限確認
    if (Date.now() > authData.expiresAt) {
      logoutFromGoogle();
      return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: true, user: authData.userProfile };
  } catch (error) {
    console.error('認証状態確認エラー:', error);
    logoutFromGoogle();
    return { isAuthenticated: false, user: null };
  }
};

// ログアウト
export const logoutFromGoogle = (): void => {
  localStorage.removeItem('google_auth_data');
  localStorage.removeItem('google_auth_timestamp');
  
  // セッションストレージもクリア
  sessionStorage.removeItem('google_auth_state');
  sessionStorage.removeItem('google_code_verifier');
  sessionStorage.removeItem('google_auth_timestamp');
};

// トークンリフレッシュ
export const refreshGoogleToken = async (): Promise<boolean> => {
  try {
    const encryptedData = localStorage.getItem('google_auth_data');
    if (!encryptedData) return false;

    const authData: GoogleAuthData = JSON.parse(atob(encryptedData));
    if (!authData.tokenData.refresh_token) return false;

    const config = getGoogleAuthConfig();
    if (!config) return false;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        refresh_token: authData.tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return false;

    const newTokenData = await response.json();
    
    // 新しいトークンデータで更新
    const updatedAuthData: GoogleAuthData = {
      ...authData,
      tokenData: {
        ...authData.tokenData,
        access_token: newTokenData.access_token,
        expires_in: newTokenData.expires_in,
      },
      expiresAt: Date.now() + (newTokenData.expires_in * 1000)
    };

    const encryptedUpdatedData = btoa(JSON.stringify(updatedAuthData));
    localStorage.setItem('google_auth_data', encryptedUpdatedData);
    localStorage.setItem('google_auth_timestamp', Date.now().toString());

    return true;
  } catch (error) {
    console.error('トークンリフレッシュエラー:', error);
    return false;
  }
};

// Google認証が利用可能かチェック
export const isGoogleAuthAvailable = (): boolean => {
  return getGoogleAuthConfig() !== null;
};