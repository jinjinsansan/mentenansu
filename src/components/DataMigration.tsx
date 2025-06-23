import React, { useState } from 'react';
import { Database, Upload, Download, RefreshCw, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { syncService, userService, consentService } from '../lib/supabase';

const DataMigration: React.FC = () => {
  const { isConnected, currentUser, loading } = useSupabase();
  const [migrating, setMigrating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [localDataCount, setLocalDataCount] = useState(0);
  const [supabaseDataCount, setSupabaseDataCount] = useState(0);
  const [localConsentCount, setLocalConsentCount] = useState(0);
  const [supabaseConsentCount, setSupabaseConsentCount] = useState(0);

  React.useEffect(() => {
    checkDataCounts();
  }, [isConnected, currentUser]);

  const checkDataCounts = () => {
    // ローカルデータ数をチェック
    const localEntries = localStorage.getItem('journalEntries');
    if (localEntries) {
      const entries = JSON.parse(localEntries);
      setLocalDataCount(entries.length);
    } else {
      setLocalDataCount(0);
    }
    
    // ローカル同意履歴数をチェック
    const localConsents = localStorage.getItem('consent_histories');
    if (localConsents) {
      const consents = JSON.parse(localConsents);
      setLocalConsentCount(consents.length);
    } else {
      setLocalConsentCount(0);
    }

    // Supabaseデータ数をチェック
    setSupabaseDataCount(0);
    setSupabaseConsentCount(0);
    
    if (isConnected) {
      // 実際のSupabaseデータ数を取得
      consentService.getAllConsentHistories().then(histories => {
        setSupabaseConsentCount(histories.length);
      }).catch(() => {
        setSupabaseConsentCount(0);
      });
    }
  };

  const handleMigrateToSupabase = async () => {
    if (!currentUser) {
      alert('ユーザーが設定されていません。');
      return;
    }

    setMigrating(true);
    setMigrationStatus('ローカルデータをSupabaseに移行中...');

    try {
      const success = await syncService.migrateLocalData(currentUser.id);
      
      if (success) {
        setMigrationStatus('移行が完了しました！');
        checkDataCounts();
      } else {
        setMigrationStatus('移行に失敗しました。');
      }
    } catch (error) {
      console.error('移行エラー:', error);
      setMigrationStatus('移行中にエラーが発生しました。');
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrateConsentsToSupabase = async () => {
    if (!currentUser) {
      alert('ユーザーが設定されていません。');
      return;
    }

    setMigrating(true);
    setMigrationStatus('同意履歴をSupabaseに移行中...');

    try {
      const success = await syncService.syncConsentHistories();
      
      if (success) {
        setMigrationStatus('同意履歴の移行が完了しました！');
        checkDataCounts();
      } else {
        setMigrationStatus('同意履歴の移行に失敗しました。');
      }
    } catch (error) {
      console.error('同意履歴移行エラー:', error);
      setMigrationStatus('同意履歴移行中にエラーが発生しました。');
    } finally {
      setMigrating(false);
    }
  };

  const handleSyncFromSupabase = async () => {
    if (!currentUser) {
      alert('ユーザーが設定されていません。');
      return;
    }

    setSyncing(true);
    setMigrationStatus('Supabaseからローカルに同期中...');

    try {
      const success = await syncService.syncToLocal(currentUser.id);
      
      if (success) {
        setMigrationStatus('同期が完了しました！');
        checkDataCounts();
      } else {
        setMigrationStatus('同期に失敗しました。');
      }
    } catch (error) {
      console.error('同期エラー:', error);
      setMigrationStatus('同期中にエラーが発生しました。');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncConsentsFromSupabase = async () => {
    if (!currentUser) {
      alert('ユーザーが設定されていません。');
      return;
    }

    setSyncing(true);
    setMigrationStatus('Supabaseから同意履歴を同期中...');

    try {
      const success = await syncService.syncConsentHistoriesToLocal();
      
      if (success) {
        setMigrationStatus('同意履歴の同期が完了しました！');
        checkDataCounts();
      } else {
        setMigrationStatus('同意履歴の同期に失敗しました。');
      }
    } catch (error) {
      console.error('同意履歴同期エラー:', error);
      setMigrationStatus('同意履歴同期中にエラーが発生しました。');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateUser = async () => {
    const lineUsername = localStorage.getItem('line-username');
    if (!lineUsername) {
      alert('LINEユーザー名が設定されていません。');
      return;
    }

    try {
      const user = await userService.createUser(lineUsername);
      if (user) {
        alert('ユーザーが作成されました！');
        window.location.reload(); // ページをリロードして状態を更新
      } else {
        alert('ユーザー作成に失敗しました。');
      }
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      alert('ユーザー作成中にエラーが発生しました。');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-jp-bold text-gray-900">データ管理</h1>
        </div>

        {/* 接続状態 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-jp-medium text-gray-900">
              Supabase接続状態: {isConnected ? '接続済み' : '未接続'}
            </span>
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-jp-normal">接続確認中...</span>
            </div>
          )}

          {!isConnected && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-jp-medium text-yellow-800">
                  Supabaseに接続できません。ローカルモードで動作中です。
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ユーザー情報 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-jp-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>ユーザー情報</span>
          </h3>
          
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-jp-normal text-gray-700">
                  ユーザーID: {currentUser.id}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-jp-normal text-gray-700">
                  ユーザー名: {currentUser.line_username}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-jp-normal text-gray-700">
                  Supabaseユーザーが作成されていません
                </span>
              </div>
              {isConnected && (
                <button
                  onClick={handleCreateUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors"
                >
                  ユーザーを作成
                </button>
              )}
            </div>
          )}
        </div>

        {/* データ統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-6 h-6 text-green-600" />
              <h3 className="font-jp-semibold text-gray-900">ローカル日記</h3>
            </div>
            <p className="text-2xl font-jp-bold text-green-600">{localDataCount}件</p>
            <p className="text-sm text-gray-600 font-jp-normal">ブラウザに保存された日記</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="font-jp-semibold text-gray-900">Supabase日記</h3>
            </div>
            <p className="text-2xl font-jp-bold text-blue-600">{supabaseDataCount}件</p>
            <p className="text-sm text-gray-600 font-jp-normal">クラウドに保存された日記</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h3 className="font-jp-semibold text-gray-900">ローカル同意</h3>
            </div>
            <p className="text-2xl font-jp-bold text-purple-600">{localConsentCount}件</p>
            <p className="text-sm text-gray-600 font-jp-normal">ブラウザに保存された同意履歴</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="font-jp-semibold text-gray-900">Supabase同意</h3>
            </div>
            <p className="text-2xl font-jp-bold text-orange-600">{supabaseConsentCount}件</p>
            <p className="text-sm text-gray-600 font-jp-normal">クラウドに保存された同意履歴</p>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="space-y-4">
          <h3 className="text-lg font-jp-bold text-gray-900">日記データの移行</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleMigrateToSupabase}
              disabled={migrating || !isConnected || !currentUser || localDataCount === 0}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors"
            >
              {migrating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>日記: ローカル → Supabase</span>
            </button>

            <button
              onClick={handleSyncFromSupabase}
              disabled={syncing || !isConnected || !currentUser}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors"
            >
              {syncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>日記: Supabase → ローカル</span>
            </button>
          </div>
          
          <h3 className="text-lg font-jp-bold text-gray-900">同意履歴の移行</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleMigrateConsentsToSupabase}
              disabled={migrating || !isConnected || !currentUser || localConsentCount === 0}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors"
            >
              {migrating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>同意: ローカル → Supabase</span>
            </button>

            <button
              onClick={handleSyncConsentsFromSupabase}
              disabled={syncing || !isConnected || !currentUser}
              className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-jp-medium transition-colors"
            >
              {syncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>同意: Supabase → ローカル</span>
            </button>
          </div>

          {/* ステータス表示 */}
          {migrationStatus && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-4 h-4 ${(migrating || syncing) ? 'animate-spin text-blue-600' : 'text-green-600'}`} />
                <span className="text-sm font-jp-normal text-gray-700">{migrationStatus}</span>
              </div>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 font-jp-normal space-y-1">
              <p className="font-jp-medium">重要な注意事項:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>データ移行は一方向のコピーです。既存データは上書きされません。</li>
                <li>移行前に重要なデータのバックアップを取ることをお勧めします。</li>
                <li>同意履歴は法的要件のため、削除されることはありません。</li>
                <li>Supabase接続が必要な操作は、接続が確立されている場合のみ実行できます。</li>
                <li>ローカルデータは常にブラウザに保存され、アプリの動作に影響しません。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMigration;