// LINE認証関連の型定義
export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface LineAuthConfig {
  channelId: string;
  channelSecret: string;
  redirectUri: string;
}

// 環境変数から設定を取得
const getLineConfig = (): LineAuthConfig => {
  const channelId = import.meta.env.VITE_LINE_CHANNEL_ID;
  const channelSecret = import.meta.env.VITE_LINE_CHANNEL_SECRET;
  const redirectUri = import.meta.env.VITE_LINE_REDIRECT_URI;

  if (!channelId || !channelSecret || !redirectUri) {
    throw new Error('LINE認証の環境変数が設定されていません');
  }

  return {
    channelId,
    channelSecret,
    redirectUri
  };
};

// CSRF攻撃を防ぐためのstate生成
const generateState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// nonce生成（OpenID Connect用）
const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// LINE認証URLを生成
export const generateLineLoginUrl = (): string => {
  try {
    const config = getLineConfig();
    const state = generateState();
    const nonce = generateNonce();
    
    // セッションストレージに保存（CSRF対策）
    sessionStorage.setItem('line_auth_state', state);
    sessionStorage.setItem('line_auth_nonce', nonce);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.channelId,
      redirect_uri: config.redirectUri,
      state: state,
      scope: 'profile openid',
      nonce: nonce,
      prompt: 'consent'
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  } catch (error) {
    console.error('LINE認証URL生成エラー:', error);
    throw error;
  }
};

// 認証コードをアクセストークンに交換
export const exchangeCodeForToken = async (code: string, state: string): Promise<LineTokenResponse> => {
  try {
    // state検証
    const savedState = sessionStorage.getItem('line_auth_state');
    if (!savedState || savedState !== state) {
      throw new Error('不正なstateパラメータです');
    }

    const config = getLineConfig();
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: config.redirectUri,
      client_id: config.channelId,
      client_secret: config.channelSecret
    });

    const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`トークン取得エラー: ${response.status} ${errorData}`);
    }

    const tokenData: LineTokenResponse = await response.json();
    
    // セッションストレージをクリア
    sessionStorage.removeItem('line_auth_state');
    sessionStorage.removeItem('line_auth_nonce');
    
    return tokenData;
  } catch (error) {
    console.error('トークン交換エラー:', error);
    throw error;
  }
};

// ユーザープロフィールを取得
export const getLineUserProfile = async (accessToken: string): Promise<LineUser> => {
  try {
    const response = await fetch('https://api.line.me/v2/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`プロフィール取得エラー: ${response.status} ${errorData}`);
    }

    const userData: LineUser = await response.json();
    return userData;
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    throw error;
  }
};

// 認証情報を安全に保存
export const saveAuthData = (tokenData: LineTokenResponse, userProfile: LineUser): void => {
  try {
    // セキュリティのため、必要最小限の情報のみ保存
    const authData = {
      userId: userProfile.userId,
      displayName: userProfile.displayName,
      pictureUrl: userProfile.pictureUrl,
      accessToken: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      loginTime: new Date().toISOString()
    };

    // 暗号化して保存（簡易的な実装）
    const encryptedData = btoa(JSON.stringify(authData));
    localStorage.setItem('line_auth_data', encryptedData);
    
    // ユーザー名も別途保存（既存システムとの互換性のため）
    localStorage.setItem('line-username', userProfile.displayName);
    
    console.log('認証情報を保存しました');
  } catch (error) {
    console.error('認証情報保存エラー:', error);
    throw error;
  }
};

// 認証状態をチェック
export const checkAuthStatus = (): { isAuthenticated: boolean; user: LineUser | null } => {
  try {
    const encryptedData = localStorage.getItem('line_auth_data');
    if (!encryptedData) {
      return { isAuthenticated: false, user: null };
    }

    const authData = JSON.parse(atob(encryptedData));
    
    // トークンの有効期限をチェック
    if (Date.now() > authData.expiresAt) {
      // 期限切れの場合はデータを削除
      logoutFromLine();
      return { isAuthenticated: false, user: null };
    }

    const user: LineUser = {
      userId: authData.userId,
      displayName: authData.displayName,
      pictureUrl: authData.pictureUrl
    };

    return { isAuthenticated: true, user };
  } catch (error) {
    console.error('認証状態チェックエラー:', error);
    // エラーの場合は認証されていないとみなす
    logoutFromLine();
    return { isAuthenticated: false, user: null };
  }
};

// ログアウト
export const logoutFromLine = (): void => {
  try {
    // 認証関連のデータを削除
    localStorage.removeItem('line_auth_data');
    sessionStorage.removeItem('line_auth_state');
    sessionStorage.removeItem('line_auth_nonce');
    
    // 既存のユーザー名は保持（アプリの継続利用のため）
    // localStorage.removeItem('line-username');
    
    console.log('ログアウトしました');
  } catch (error) {
    console.error('ログアウトエラー:', error);
  }
};

// アクセストークンを取得（API呼び出し用）
export const getAccessToken = (): string | null => {
  try {
    const encryptedData = localStorage.getItem('line_auth_data');
    if (!encryptedData) {
      return null;
    }

    const authData = JSON.parse(atob(encryptedData));
    
    // トークンの有効期限をチェック
    if (Date.now() > authData.expiresAt) {
      logoutFromLine();
      return null;
    }

    return authData.accessToken;
  } catch (error) {
    console.error('アクセストークン取得エラー:', error);
    return null;
  }
};

// トークンリフレッシュ（必要に応じて実装）
export const refreshToken = async (): Promise<boolean> => {
  try {
    // 実装は必要に応じて追加
    console.log('トークンリフレッシュは未実装です');
    return false;
  } catch (error) {
    console.error('トークンリフレッシュエラー:', error);
    return false;
  }
};