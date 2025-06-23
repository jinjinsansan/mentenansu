// LINE Login API関連の設定と関数
const LINE_CHANNEL_ID = '2007620960';

// 独自ドメインに対応したリダイレクトURI設定
const getRedirectUri = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost') {
    return 'http://localhost:5173/auth/callback';
  }
  
  // 独自ドメインまたはNetlifyドメインに対応
  return `${window.location.origin}/auth/callback`;
};

const LINE_REDIRECT_URI = getRedirectUri();

export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token: string;
}

// LINE Login URLを生成
export const generateLineLoginUrl = (): string => {
  const state = generateRandomState();
  const nonce = generateRandomNonce();
  
  // セキュリティのためstateとnonceをセッションストレージに保存
  sessionStorage.setItem('line_auth_state', state);
  sessionStorage.setItem('line_auth_nonce', nonce);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_CHANNEL_ID,
    redirect_uri: LINE_REDIRECT_URI,
    state: state,
    scope: 'profile openid',
    nonce: nonce
  });
  
  return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
};

// ランダムなstate値を生成（CSRF攻撃防止）
const generateRandomState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// ランダムなnonce値を生成（リプレイ攻撃防止）
const generateRandomNonce = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// 認証コードをアクセストークンに交換
export const exchangeCodeForToken = async (code: string, state: string): Promise<LineAuthResponse> => {
  // state検証（CSRF攻撃防止）
  const savedState = sessionStorage.getItem('line_auth_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter. Possible CSRF attack.');
  }
  
  const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: LINE_REDIRECT_URI,
      client_id: LINE_CHANNEL_ID,
      client_secret: '2e76f46f6b67f5d872025891122c30ca'
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
  }
  
  const tokenData = await response.json();
  
  // nonce検証（ID tokenがある場合）
  if (tokenData.id_token) {
    const savedNonce = sessionStorage.getItem('line_auth_nonce');
    if (savedNonce) {
      // 実際のプロダクションではJWTライブラリを使用してID tokenを検証
      console.log('ID token received, nonce validation should be implemented');
    }
  }
  
  // セキュリティ情報をクリア
  sessionStorage.removeItem('line_auth_state');
  sessionStorage.removeItem('line_auth_nonce');
  
  return tokenData;
};

// アクセストークンを使用してユーザー情報を取得
export const getLineUserProfile = async (accessToken: string): Promise<LineUser> => {
  const response = await fetch('https://api.line.me/v2/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Profile fetch failed: ${errorData.message || 'Unknown error'}`);
  }
  
  return await response.json();
};

// ログアウト処理
export const logoutFromLine = (): void => {
  // ローカルストレージから認証情報を削除
  localStorage.removeItem('line_access_token');
  localStorage.removeItem('line_user_profile');
  localStorage.removeItem('line_auth_timestamp');
  
  // セッションストレージもクリア
  sessionStorage.removeItem('line_auth_state');
  sessionStorage.removeItem('line_auth_nonce');
};

// 認証状態をチェック
export const checkAuthStatus = (): { isAuthenticated: boolean; user: LineUser | null } => {
  const accessToken = localStorage.getItem('line_access_token');
  const userProfile = localStorage.getItem('line_user_profile');
  const authTimestamp = localStorage.getItem('line_auth_timestamp');
  
  if (!accessToken || !userProfile || !authTimestamp) {
    return { isAuthenticated: false, user: null };
  }
  
  // トークンの有効期限をチェック（30日間）
  const tokenAge = Date.now() - parseInt(authTimestamp);
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30日
  
  if (tokenAge > maxAge) {
    logoutFromLine();
    return { isAuthenticated: false, user: null };
  }
  
  try {
    const user = JSON.parse(userProfile);
    return { isAuthenticated: true, user };
  } catch (error) {
    console.error('Failed to parse user profile:', error);
    logoutFromLine();
    return { isAuthenticated: false, user: null };
  }
};

// 認証情報を安全に保存
export const saveAuthData = (tokenData: LineAuthResponse, userProfile: LineUser): void => {
  localStorage.setItem('line_access_token', tokenData.access_token);
  localStorage.setItem('line_user_profile', JSON.stringify(userProfile));
  localStorage.setItem('line_auth_timestamp', Date.now().toString());
  
  // リフレッシュトークンは別途安全に保存（実装は環境に依存）
  if (tokenData.refresh_token) {
    localStorage.setItem('line_refresh_token', tokenData.refresh_token);
  }
};