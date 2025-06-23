import { useState, useEffect } from 'react';
import { supabase, userService, diaryService, syncService } from '../lib/supabase';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    
    if (!supabase) {
      // 開発環境でのみログ出力
      if (import.meta.env.DEV) {
        console.log('Supabase未設定 - ローカルモードで動作');
      }
      setIsConnected(false);
      setLoading(false);
      return;
    }

    try {
      // 接続テスト
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        console.error('Supabase接続エラー:', error);
        setIsConnected(false);
      } else {
        if (import.meta.env.DEV) {
          console.log('Supabase接続成功');
        }
        setIsConnected(true);
        
        // 既存ユーザーの確認
        const lineUsername = localStorage.getItem('line-username');
        if (lineUsername) {
          // まず既存ユーザーをチェック
          const existingUser = await userService.getUserByUsername(lineUsername);
          if (existingUser) {
            setCurrentUser(existingUser);
          }
          await initializeUser(lineUsername);
        }
      }
    } catch (error) {
      console.error('接続チェックエラー:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const initializeUser = async (lineUsername: string) => {
    if (!isConnected) return null;

    try {
      // 既存ユーザーを検索
      let user = await userService.getUserByUsername(lineUsername);
      
      if (!user) {
        // 新規ユーザー作成
        user = await userService.createUser(lineUsername);
        
        if (user) {
          console.log('新規ユーザーを作成しました:', user);
          // ローカルデータを移行
          await syncService.migrateLocalData(user.id);
        } else {
          console.error('ユーザー作成に失敗しました');
          return null;
        }
      } else {
        console.log('既存ユーザーを使用します:', user);
        // 既存ユーザーの場合、Supabaseからローカルに同期
        await syncService.syncToLocal(user.id);
      }
      
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('ユーザー初期化エラー:', error);
      return null;
    }
  };

  const saveEntry = async (entryData: any) => {
    // まずローカルストレージに保存（既存の動作を維持）
    const existingEntries = localStorage.getItem('journalEntries');
    const entries = existingEntries ? JSON.parse(existingEntries) : [];
    
    const newEntry = {
      id: Date.now().toString(),
      ...entryData
    };
    
    entries.unshift(newEntry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    // Supabaseにも保存（バックグラウンドで）
    if (isConnected && currentUser) {
      try {
        await diaryService.createEntry({
          user_id: currentUser.id,
          date: entryData.date,
          emotion: entryData.emotion,
          event: entryData.event,
          realization: entryData.realization,
          self_esteem_score: entryData.selfEsteemScore,
          worthlessness_score: entryData.worthlessnessScore
        });
        if (import.meta.env.DEV) {
          console.log('Supabaseにも保存しました');
        }
      } catch (error) {
        console.error('Supabase保存エラー:', error);
        // エラーが発生してもローカル保存は成功しているので続行
      }
    }

    return newEntry;
  };

  const updateEntry = async (id: string, updates: any) => {
    // ローカルストレージを更新
    const existingEntries = localStorage.getItem('journalEntries');
    if (existingEntries) {
      const entries = JSON.parse(existingEntries);
      const updatedEntries = entries.map((entry: any) => 
        entry.id === id ? { ...entry, ...updates } : entry
      );
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }

    // Supabaseも更新
    if (isConnected && currentUser) {
      try {
        await diaryService.updateEntry(id, {
          date: updates.date,
          emotion: updates.emotion,
          event: updates.event,
          realization: updates.realization,
          self_esteem_score: updates.selfEsteemScore,
          worthlessness_score: updates.worthlessnessScore
        });
        if (import.meta.env.DEV) {
          console.log('Supabaseも更新しました');
        }
      } catch (error) {
        console.error('Supabase更新エラー:', error);
      }
    }
  };

  const deleteEntry = async (id: string) => {
    // ローカルストレージから削除
    const existingEntries = localStorage.getItem('journalEntries');
    if (existingEntries) {
      const entries = JSON.parse(existingEntries);
      const filteredEntries = entries.filter((entry: any) => entry.id !== id);
      localStorage.setItem('journalEntries', JSON.stringify(filteredEntries));
    }

    // Supabaseからも削除
    if (isConnected && currentUser) {
      try {
        await diaryService.deleteEntry(id);
        if (import.meta.env.DEV) {
          console.log('Supabaseからも削除しました');
        }
      } catch (error) {
        console.error('Supabase削除エラー:', error);
      }
    }
  };

  return {
    isConnected,
    currentUser,
    loading,
    initializeUser,
    saveEntry,
    updateEntry,
    deleteEntry,
    checkConnection
  };
};