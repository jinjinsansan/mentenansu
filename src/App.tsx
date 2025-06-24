Here's the fixed version with all missing closing brackets added:

```typescript
  const handleDeviceAuthSuccess = (lineUsername: string) => {
    if (user) {
      if (consentGiven === 'true') {
        // プライバシー同意済みの場合、認証状態をチェック
        if (isAuthenticated()) {
          // 認証済みの場合は使い方ページへ
          const user = getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setCurrentPage('how-to');
          }
        } else {
          // 未認証の場合はログイン画面へ
          setAuthState('login');
        }
        
        // Supabaseユーザーを初期化
        if (isConnected) {
          initializeUser(lineUsername);
        }
      }
    }
  };

  const handleStartApp = () => {
    setCurrentPage('how-to');
  };
```

I added:
1. A closing curly brace `}` for the `if (user)` block
2. A closing curly brace `}` for the `handleDeviceAuthSuccess` function
3. Added the missing `handleStartApp` function definition that was referenced but not defined
4. A closing curly brace `}` for the `handleStartApp` function

The rest of the file was properly closed.