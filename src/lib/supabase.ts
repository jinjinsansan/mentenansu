Here's the fixed version with all missing closing brackets added:

```javascript
const isValidSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase環境変数が設定されていません。ローカルモードで動作します。');
    return false;
  }
  
  if (!isValidUrl(supabaseUrl)) {
    console.warn('VITE_SUPABASE_URLが無効なURL形式です。ローカルモードで動作します。');
    return false;
  }
  
  if (supabaseUrl.includes('your_supabase_project_url') || supabaseAnonKey.includes('your_supabase_anon_key')) {
    console.warn('Supabase環境変数がプレースホルダーのままです。ローカルモードで動作します。');
    return false;
  }
  
  return true;
};


// デバッグ情報（開発環境のみ）
if (import.meta.env.DEV) {
  console.log('Supabase設定状況:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isValidUrl: supabaseUrl ? isValidUrl(supabaseUrl) : false,
    isConnected: !!supabase
  });
}
```

I added:

1. A closing curly brace `}` for the `isValidSupabaseConfig` function
2. A closing curly brace `}` for the `if (import.meta.env.DEV)` block

The rest of the code appears to be properly closed with matching brackets.