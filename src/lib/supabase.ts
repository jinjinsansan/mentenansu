import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数の検証（本番環境対応）
const isValidUrl = (url: string): boolean => {
  try {
    if (!url || url.trim() === '' || url.includes('your_supabase_project_url') || url.includes('your-supabase-anon-key')) {
      return false;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidSupabaseKey = (key: string): boolean => {
  return !!(key && 
    key.trim() !== '' && 
    !key.includes('your_supabase_project_url') && 
    !key.includes('your_supabase_anon_key') &&
    key.length > 20);
};

// 本番環境での詳細な検証
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase環境変数が設定されていません。ローカルモードで動作します。');
} else if (!isValidUrl(supabaseUrl) || !isValidSupabaseKey(supabaseAnonKey)) {
  console.warn('Supabase環境変数が無効です。設定を確認してください。');
  console.log('URL:', supabaseUrl ? 'あり' : 'なし');
  console.log('Key:', supabaseAnonKey ? 'あり' : 'なし');
}

export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
      // まず既存ユーザーをチェック
      const existingUser = await this.getUserByUsername(lineUsername);
      if (existingUser) {
        console.log('ユーザーは既に存在します:', existingUser);
        return existingUser;
      }
      
      // 新規ユーザー作成
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          line_username: lineUsername,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      
      // 重複エラーの場合は既存ユーザーを返す
      if (error instanceof Error && error.message.includes('duplicate key')) {
        console.log('重複エラーのため既存ユーザーを取得します');
        return await this.getUserByUsername(lineUsername);
      }
      
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
      
      if (error) {
        // ユーザーが見つからない場合は null を返す
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      return null;
    }
  },

  // 本番環境用：ユーザー統計取得
  async getUserStats(): Promise<{ total: number; today: number; thisWeek: number } | null> {
    if (!supabase) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
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
  async getAllEntries(limit = 100, offset = 0): Promise<any[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select(`
          *,
          users!inner(
            id,
            line_username,
            created_at
          )
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

  // 本番環境用：日記統計取得
  async getDiaryStats(): Promise<{ total: number; today: number; thisWeek: number; byEmotion: Record<string, number> } | null> {
    if (!supabase) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [totalResult, todayResult, weekResult, emotionResult] = await Promise.all([
        supabase.from('diary_entries').select('id', { count: 'exact' }),
        supabase.from('diary_entries').select('id', { count: 'exact' }).gte('date', today),
        supabase.from('diary_entries').select('id', { count: 'exact' }).gte('date', weekAgo),
        supabase.from('diary_entries').select('emotion')
      ]);
      
      // 感情別集計
      const byEmotion: Record<string, number> = {};
      if (emotionResult.data) {
        emotionResult.data.forEach(entry => {
          byEmotion[entry.emotion] = (byEmotion[entry.emotion] || 0) + 1;
        });
      }
      
      return {
        total: totalResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: weekResult.count || 0,
        byEmotion
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
  async createConsentRecord(record: Omit<ConsentHistory, 'id' | 'created_at'>): Promise<ConsentHistory | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .insert([record])
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

  async getConsentHistoryByUsername(lineUsername: string): Promise<ConsentHistory | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('consent_histories')
        .select('*')
        .eq('line_username', lineUsername)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ユーザー同意履歴取得エラー:', error);
      return null;
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
      if (entries.length === 0) return true;
      
      // バッチ処理で効率的に保存（本番環境対応）
      const batchSize = 50; // 一度に50件ずつ処理
      
      for (const entry of entries) {
        try {
          // 既存エントリーの重複チェック
          const { data: existing } = await supabase
            .from('diary_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('date', entry.date)
            .eq('emotion', entry.emotion)
            .single();
          
          if (!existing) {
            await diaryService.createEntry({
              user_id: userId,
              date: entry.date,
              emotion: entry.emotion,
              event: entry.event,
              realization: entry.realization,
              self_esteem_score: entry.selfEsteemScore || 50,
              worthlessness_score: entry.worthlessnessScore || 50
            });
          }
        } catch (entryError) {
          console.warn('エントリー移行スキップ:', entry.id, entryError);
          // 個別エラーは警告として処理し、全体の処理は継続
        }
      }
      
      console.log('ローカルデータの移行が完了しました');
      return true;
    } catch (error) {
      console.error('データ移行エラー:', error);
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

  // 同意履歴をSupabaseに同期
  async syncConsentHistories(): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      // ローカルストレージから同意履歴を取得
      const localHistories = localStorage.getItem('consent_histories');
      if (!localHistories) return true;
      
      const histories = JSON.parse(localHistories);
      
      // Supabaseに保存
      for (const history of histories) {
        // 既存の記録をチェック
        const existing = await consentService.getConsentHistoryByUsername(history.line_username);
        if (!existing) {
          await consentService.createConsentRecord({
            line_username: history.line_username,
            consent_given: history.consent_given,
            consent_date: history.consent_date,
            ip_address: history.ip_address,
            user_agent: history.user_agent
          });
        }
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
      
      // ローカルストレージ形式に変換
      const localFormat = histories.map(history => ({
        id: history.id,
        line_username: history.line_username,
        consent_given: history.consent_given,
        consent_date: history.consent_date,
        ip_address: history.ip_address,
        user_agent: history.user_agent
      }));
      
      localStorage.setItem('consent_histories', JSON.stringify(localFormat));
      console.log('同意履歴のローカル同期が完了しました');
      return true;
    } catch (error) {
      console.error('同意履歴ローカル同期エラー:', error);
      return false;
    }
  },

  // 本番環境用：大量データの効率的な同期
  async bulkMigrateLocalData(userId: string, progressCallback?: (progress: number) => void): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const localEntries = localStorage.getItem('journalEntries');
      if (!localEntries) return true;
      
      const entries = JSON.parse(localEntries);
      if (entries.length === 0) return true;
      
      const batchSize = 20;
      const totalBatches = Math.ceil(entries.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = entries.slice(i * batchSize, (i + 1) * batchSize);
        
        const insertData = batch.map((entry: any) => ({
          user_id: userId,
          date: entry.date,
          emotion: entry.emotion,
          event: entry.event,
          realization: entry.realization,
          self_esteem_score: entry.selfEsteemScore || 50,
          worthlessness_score: entry.worthlessnessScore || 50
        }));
        
        const { error } = await supabase
          .from('diary_entries')
          .upsert(insertData, { 
            onConflict: 'user_id,date,emotion',
            ignoreDuplicates: true 
          });
        
        if (error) {
          console.warn('バッチ処理エラー:', error);
        }
        
        // 進捗報告
        if (progressCallback) {
          const progress = Math.round(((i + 1) / totalBatches) * 100);
          progressCallback(progress);
        }
        
        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('大量データの移行が完了しました');
      return true;
    } catch (error) {
      console.error('大量データ移行エラー:', error);
      return false;
    }
  }
};