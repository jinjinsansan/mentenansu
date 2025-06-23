import { useState, useEffect } from 'react';

interface MaintenanceConfig {
  isEnabled: boolean;
  message: string;
  endTime?: string;
  type: 'scheduled' | 'emergency' | 'completed';
  progress?: number;
  estimatedDuration?: string;
  affectedFeatures?: string[];
  contactInfo?: string;
}

interface MaintenanceStatus {
  isMaintenanceMode: boolean;
  config: MaintenanceConfig | null;
  loading: boolean;
  error: string | null;
}

export const useMaintenanceStatus = () => {
  const [status, setStatus] = useState<MaintenanceStatus>({
    isMaintenanceMode: false,
    config: null,
    loading: true,
    error: null
  });

  const checkMaintenanceStatus = async (isInitialLoad = false) => {
    try {
      // 初回読み込み時のみローディング状態を表示
      if (isInitialLoad) {
        setStatus(prev => ({ ...prev, loading: true, error: null }));
      }

      // 1. 環境変数をチェック
      const envMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
      const envMaintenanceMessage = import.meta.env.VITE_MAINTENANCE_MESSAGE || 'システムメンテナンス中です';
      const envMaintenanceEndTime = import.meta.env.VITE_MAINTENANCE_END_TIME;

      if (envMaintenanceMode) {
        setStatus({
          isMaintenanceMode: true,
          config: {
            isEnabled: true,
            message: envMaintenanceMessage,
            endTime: envMaintenanceEndTime,
            type: 'scheduled',
            estimatedDuration: '約30分',
            affectedFeatures: ['日記作成', '検索機能', 'データ同期'],
            contactInfo: 'info@namisapo.com'
          },
          loading: isInitialLoad ? false : status.loading,
          error: null
        });
        return;
      }

      // 2. リモート設定をチェック（Supabase Functions経由）
      try {
        const response = await fetch('/api/maintenance-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const remoteConfig = await response.json();
          if (remoteConfig.isEnabled) {
            setStatus({
              isMaintenanceMode: true,
              config: remoteConfig,
              loading: isInitialLoad ? false : status.loading,
              error: null
            });
            return;
          }
        }
      } catch (remoteError) {
        console.log('リモート設定の取得に失敗しました（環境変数を使用）:', remoteError);
      }

      // 3. ローカル設定をチェック（開発・テスト用）
      const localConfig = localStorage.getItem('maintenance_config');
      if (localConfig) {
        try {
          const parsedConfig = JSON.parse(localConfig);
          if (parsedConfig.isEnabled) {
            setStatus({
              isMaintenanceMode: true,
              config: parsedConfig,
              loading: isInitialLoad ? false : status.loading,
              error: null
            });
            return;
          }
        } catch (parseError) {
          console.error('ローカル設定の解析に失敗:', parseError);
        }
      }

      // 4. メンテナンスモードではない
      setStatus({
        isMaintenanceMode: false,
        config: null,
        loading: isInitialLoad ? false : status.loading,
        error: null
      });

    } catch (error) {
      console.error('メンテナンス状態の確認に失敗:', error);
      setStatus({
        isMaintenanceMode: false,
        config: null,
        loading: isInitialLoad ? false : status.loading,
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  };

  // 定期的にメンテナンス状態をチェック
  useEffect(() => {
    // 初回は loading 状態を表示
    checkMaintenanceStatus(true);

    // 30秒ごとにバックグラウンドでチェック（loading状態は変更しない）
    const interval = setInterval(() => checkMaintenanceStatus(false), 30000);

    return () => clearInterval(interval);
  }, []);

  // 手動でステータスを更新
  const refreshStatus = () => {
    checkMaintenanceStatus(true);
  };

  // 開発・テスト用：ローカルでメンテナンスモードを設定
  const setLocalMaintenanceMode = (config: MaintenanceConfig) => {
    localStorage.setItem('maintenance_config', JSON.stringify(config));
    checkMaintenanceStatus(true);
  };

  // 開発・テスト用：ローカルメンテナンスモードを解除
  const clearLocalMaintenanceMode = () => {
    localStorage.removeItem('maintenance_config');
    checkMaintenanceStatus(true);
  };

  return {
    ...status,
    refreshStatus,
    setLocalMaintenanceMode,
    clearLocalMaintenanceMode
  };
};