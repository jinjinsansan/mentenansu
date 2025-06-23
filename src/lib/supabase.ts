import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URL形式の検証関数
const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Supabase設定の検証
const isValidSupabaseConfig = () => {
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

export const supabase = isValidSupabaseConfig() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// デバッグ情報（開発環境のみ）
if (import.meta.env.DEV) {
  console.log('Supabase設定状況:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isValidUrl: supabaseUrl ? isValidUrl(supabaseUrl) : false,
    isConnected: !!supabase
  });
}

// データベース型定義
export interface User {
  id: string;
  line_username: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  self_esteem_score: number;
  worthlessness_score: number;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  user_id: string;
  counselor_id?: string;
  status: 'active' | 'closed' | 'waiting';
  created_at: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id?: string;
  counselor_id?: string;
  content: string;
  is_counselor: boolean;
  created_at: string;
}

export interface Counselor {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface ConsentHistory {
  id: string;
  line_username: string;
  consent_given: boolean;
  consent_date: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// ユーザー管理関数
export const userService = {
  async createUser(lineUsername: string): Promise<User | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ line_username: lineUsername }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      return null;
    }
  },

  async getUserByUsername(lineUsername: string): Promise<User | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('line_username', lineUsername)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      return null;
    }
  },

  async getUserStats(): Promise<{ total: number; today: number; thisWeek: number } | null> {
    if (!supabase) return null;
    
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [totalResult, todayResult, weekResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }).gte('created_at', today),
        supabase.from('users').select('id', { count: 'exact' }).gte('created_at', weekAgo)
      ]);

      return {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: weekResult.count || 0
      };
    } catch (error) {
      console.error('ユーザー統計取得エラー:', error);
      return null;
    }
  }
};

// 日記管理関数
export const diaryService = {
  async createEntry(entry: Omit<DiaryEntry, 'id' | 'created_at'>): Promise<DiaryEntry | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .insert([entry])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('日記作成エラー:', error);
      return null;
    }
  },

  async getUserEntries(userId: string): Promise<DiaryEntry[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('日記取得エラー:', error);
      return [];
    }
  },

  async updateEntry(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('日記更新エラー:', error);
      return null;
    }
  },

  async deleteEntry(id: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('日記削除エラー:', error);
      return false;
    }
  },

  // 管理画面用：全ユーザーの日記を取得
  async getAllEntries(limit = 100, offset = 0): Promise<DiaryEntry[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select(`
          *,
          users!inner(line_username)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('全日記取得エラー:', error);
      return [];
    }
  },

  async getDiaryStats(): Promise<{ total: number; today: number; thisWeek: number; byEmotion: Record<string, number> } | null> {
    if (!supabase) return null;
    
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [totalResult, todayResult, weekResult, emotionResult] = await Promise.all([
        supabase.from('diary_entries').select('id', { count: 'exact' }),
        supabase.from('diary_entries').select('id', { count: 'exact' }).gte('created_at', today),
        supabase.from('diary_entries').select('id', { count: 'exact' }).gte('created_at', weekAgo),
        supabase.from('diary_entries').select('emotion')
      ]);

      const emotionCounts: Record<string, number> = {};
      if (emotionResult.data) {
        emotionResult.data.forEach(entry => {
          emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        });
      }

      return {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: weekResult.count || 0,
        byEmotion: emotionCounts
      };
    } catch (error) {
      console.error('日記統計取得エラー:', error);
      return null;
    }
  }
};

// チャット管理関数
export const chatService = {
  async createChatRoom(userId: string): Promise<ChatRoom | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert([{ user_id: userId, status: 'waiting' }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('チャットルーム作成エラー:', error);
      return null;
    }
  },

  async getUserChatRoom(userId: string): Promise<ChatRoom | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('チャットルーム取得エラー:', error);
      return null;
    }
  },

  async sendMessage(chatRoomId: string, content: string, senderId?: string, counselorId?: string): Promise<Message | null> {
    if (!supabase) return null;
    
    try {
      const messageData = {
        chat_room_id: chatRoomId,
        content,
        is_counselor: !!counselorId,
        ...(counselorId ? { counselor_id: counselorId } : { sender_id: senderId })
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      return null;
    }
  },

  async getChatMessages(chatRoomId: string): Promise<Message[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      return [];
    }
  }
};

// カウンセラー管理関数
export const counselorService = {
  async getAllCounselors(): Promise<Counselor[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('counselors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('カウンセラー取得エラー:', error);
      return [];
    }
  },

  async createCounselor(name: string, email: string): Promise<Counselor | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('counselors')
        .insert([{ name, email }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('カウンセラー作成エラー:', error);
      return null;
    }
  }
};

// 同意履歴管理関数
export const consentService = {
  async createConsentHistory(consentData: Omit<ConsentHistory, 'id' | 'created_at'>): Promise<ConsentHistory | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .insert([consentData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('同意履歴作成エラー:', error);
      return null;
    }
  },

  async getAllConsentHistories(): Promise<ConsentHistory[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('同意履歴取得エラー:', error);
      return [];
    }
  },

  async getConsentHistoriesByUsername(lineUsername: string): Promise<ConsentHistory[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .select('*')
        .eq('line_username', lineUsername)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('ユーザー別同意履歴取得エラー:', error);
      return [];
    }
  }
};

// データ同期ユーティリティ
export const syncService = {
  // ローカルストレージからSupabaseへデータを移行
  async migrateLocalData(userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      // ローカルストレージから日記データを取得
      const localEntries = localStorage.getItem('journalEntries');
      if (!localEntries) return true;
      
      const entries = JSON.parse(localEntries);
      
      // Supabaseに保存
      for (const entry of entries) {
        await diaryService.createEntry({
          user_id: userId,
          date: entry.date,
          emotion: entry.emotion,
          event: entry.event,
          realization: entry.realization,
          self_esteem_score: entry.selfEsteemScore,
          worthlessness_score: entry.worthlessnessScore
        });
      }
      
      console.log('ローカルデータの移行が完了しました');
      return true;
    } catch (error) {
      console.error('データ移行エラー:', error);
      return false;
    }
  },

  // 大量データ対応の移行処理
  async bulkMigrateLocalData(userId: string, onProgress?: (progress: number) => void): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const localEntries = localStorage.getItem('journalEntries');
      if (!localEntries) return true;
      
      const entries = JSON.parse(localEntries);
      const total = entries.length;
      
      if (total === 0) return true;
      
      // バッチサイズを設定（一度に処理する件数）
      const batchSize = 10;
      let processed = 0;
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        // バッチ処理
        const promises = batch.map((entry: any) => 
          diaryService.createEntry({
            user_id: userId,
            date: entry.date,
            emotion: entry.emotion,
            event: entry.event,
            realization: entry.realization,
            self_esteem_score: entry.selfEsteemScore,
            worthlessness_score: entry.worthlessnessScore
          })
        );
        
        await Promise.all(promises);
        processed += batch.length;
        
        // 進捗を報告
        if (onProgress) {
          const progress = Math.round((processed / total) * 100);
          onProgress(progress);
        }
        
        // 少し待機してサーバー負荷を軽減
        if (i + batchSize < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('大量データの移行が完了しました');
      return true;
    } catch (error) {
      console.error('大量データ移行エラー:', error);
      return false;
    }
  },

  // Supabaseからローカルストレージにデータを同期
  async syncToLocal(userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const entries = await diaryService.getUserEntries(userId);
      
      // ローカルストレージ形式に変換
      const localFormat = entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        emotion: entry.emotion,
        event: entry.event,
        realization: entry.realization,
        selfEsteemScore: entry.self_esteem_score,
        worthlessnessScore: entry.worthlessness_score
      }));
      
      localStorage.setItem('journalEntries', JSON.stringify(localFormat));
      console.log('Supabaseからローカルへの同期が完了しました');
      return true;
    } catch (error) {
      console.error('同期エラー:', error);
      return false;
    }
  },

  // 同意履歴の同期
  async syncConsentHistories(): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const localHistories = localStorage.getItem('consent_histories');
      if (!localHistories) return true;
      
      const histories = JSON.parse(localHistories);
      
      for (const history of histories) {
        await consentService.createConsentHistory({
          line_username: history.line_username,
          consent_given: history.consent_given,
          consent_date: history.consent_date,
          ip_address: history.ip_address,
          user_agent: history.user_agent
        });
      }
      
      console.log('同意履歴の同期が完了しました');
      return true;
    } catch (error) {
      console.error('同意履歴同期エラー:', error);
      return false;
    }
  },

  // Supabaseから同意履歴をローカルに同期
  async syncConsentHistoriesToLocal(): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const histories = await consentService.getAllConsentHistories();
      localStorage.setItem('consent_histories', JSON.stringify(histories));
      console.log('Supabaseから同意履歴をローカルに同期しました');
      return true;
    } catch (error) {
      console.error('同意履歴ローカル同期エラー:', error);
      return false;
    }
  }
};