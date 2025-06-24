import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, AlertTriangle, Tag, ChevronDown, ChevronUp, RotateCcw, Download, Eye } from 'lucide-react';

interface SearchFilters {
  keyword: string;
  emotion: string;
  urgency: string;
  counselor: string;
  dateRange: {
    start: string;
    end: string;
  };
  userSearch: string;
  hasNotes: boolean | null;
  scoreRange: {
    selfEsteemMin: number;
    selfEsteemMax: number;
    worthlessnessMin: number;
    worthlessnessMax: number;
  };
}

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  self_esteem_score?: number;
  worthlessness_score?: number;
  created_at: string;
  user?: {
    line_username: string;
  };
  assigned_counselor?: string;
  urgency_level?: 'high' | 'medium' | 'low';
  counselor_memo?: string;
}

interface AdvancedSearchFilterProps {
  entries: JournalEntry[];
  onFilteredResults: (filtered: JournalEntry[]) => void;
  onViewEntry: (entry: JournalEntry) => void;
}

const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  entries,
  onFilteredResults,
  onViewEntry
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    emotion: '',
    urgency: '',
    counselor: '',
    dateRange: {
      start: '',
      end: ''
    },
    userSearch: '',
    hasNotes: null,
    scoreRange: {
      selfEsteemMin: 0,
      selfEsteemMax: 100,
      worthlessnessMin: 0,
      worthlessnessMax: 100
    }
  });

  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(entries);
  const [savedSearches, setSavedSearches] = useState<Array<{id: string, name: string, filters: SearchFilters}>>([]);
  const [searchName, setSearchName] = useState('');
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const emotions = [
    '恐怖', '悲しみ', '怒り', '悔しい', '無価値感', '罪悪感', '寂しさ', '恥ずかしさ'
  ];

  const counselors = [
    '未割り当て',
    '仁カウンセラー',
    'AOIカウンセラー',
    'あさみカウンセラー',
    'SHUカウンセラー',
    'ゆーちゃカウンセラー',
    'sammyカウンセラー'
  ];

  const urgencyLevels = [
    { value: 'high', label: '高', color: 'text-red-600' },
    { value: 'medium', label: '中', color: 'text-yellow-600' },
    { value: 'low', label: '低', color: 'text-green-600' }
  ];

  useEffect(() => {
    applyFilters();
  }, [filters, entries]);

  useEffect(() => {
    // 保存された検索条件を読み込み
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const applyFilters = () => {
    let filtered = [...entries];

    // キーワード検索
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.event.toLowerCase().includes(keyword) ||
        entry.realization.toLowerCase().includes(keyword) ||
        (entry.counselor_memo || '').toLowerCase().includes(keyword)
      );
    }

    // 感情フィルター
    if (filters.emotion) {
      filtered = filtered.filter(entry => entry.emotion === filters.emotion);
    }

    // 緊急度フィルター
    if (filters.urgency) {
      filtered = filtered.filter(entry => entry.urgency_level === filters.urgency);
    }

    // カウンセラーフィルター
    if (filters.counselor) {
      filtered = filtered.filter(entry => 
        (entry.assigned_counselor || '未割り当て') === filters.counselor
      );
    }

    // 日付範囲フィルター
    if (filters.dateRange.start) {
      filtered = filtered.filter(entry => entry.date >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(entry => entry.date <= filters.dateRange.end);
    }

    // ユーザー検索
    if (filters.userSearch.trim()) {
      const userKeyword = filters.userSearch.toLowerCase();
      filtered = filtered.filter(entry =>
        (entry.user?.line_username || '').toLowerCase().includes(userKeyword)
      );
    }

    // メモの有無フィルター
    if (filters.hasNotes !== null) {
      filtered = filtered.filter(entry => {
        const hasNotes = !!(entry.counselor_memo && entry.counselor_memo.trim());
        return filters.hasNotes ? hasNotes : !hasNotes;
      });
    }

    // スコア範囲フィルター（無価値感の場合のみ）
    filtered = filtered.filter(entry => {
      if (entry.emotion !== '無価値感') return true;
      
      const selfEsteem = entry.self_esteem_score || 0;
      const worthlessness = entry.worthlessness_score || 0;
      
      return selfEsteem >= filters.scoreRange.selfEsteemMin &&
             selfEsteem <= filters.scoreRange.selfEsteemMax &&
             worthlessness >= filters.scoreRange.worthlessnessMin &&
             worthlessness <= filters.scoreRange.worthlessnessMax;
    });

    // 日付順でソート（新しい順）
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEntries(filtered);
    onFilteredResults(filtered);
  };

  const handleShowDeleteConfirm = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      // ローカルストレージのデータを更新
      const localEntries = localStorage.getItem('journalEntries');
      if (localEntries) {
        const parsedEntries = JSON.parse(localEntries);
        const updatedEntries = parsedEntries.filter((entry: any) => entry.id !== entryToDelete);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        
        // 状態を更新
        const updatedFilteredEntries = filteredEntries.filter(entry => entry.id !== entryToDelete);
        setFilteredEntries(updatedFilteredEntries);
        onFilteredResults(updatedFilteredEntries);
        
        // セキュリティイベントをログ
        try {
          const user = getCurrentUser();
          if (user) {
            logSecurityEvent('entry_deleted', user.lineUsername, `検索画面から日記エントリー(ID: ${entryToDelete})が削除されました`);
          }
        } catch (error) {
          console.error('セキュリティログ記録エラー:', error);
        }
        
        setShowDeleteConfirm(false);
        setEntryToDelete(null);
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    }
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: '',
      emotion: '',
      urgency: '',
      counselor: '',
      dateRange: {
        start: '',
        end: ''
      },
      userSearch: '',
      hasNotes: null,
      scoreRange: {
        selfEsteemMin: 0,
        selfEsteemMax: 100,
        worthlessnessMin: 0,
        worthlessnessMax: 100
      }
    });
  };

  const saveCurrentSearch = () => {
    if (!searchName.trim()) {
      alert('検索条件名を入力してください。');
      return;
    }

    const newSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...filters }
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    setSearchName('');
    setShowSaveSearch(false);
    alert('検索条件を保存しました！');
  };

  const loadSavedSearch = (savedFilters: SearchFilters) => {
    setFilters(savedFilters);
    setIsExpanded(true);
  };

  const deleteSavedSearch = (id: string) => {
    if (window.confirm('この保存された検索条件を削除しますか？')) {
      const updated = savedSearches.filter(search => search.id !== id);
      setSavedSearches(updated);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
    }
  };

  const exportResults = () => {
    // UTF-8 BOMを追加して文字化けを防ぐ
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      ['日付', 'ユーザー', '感情', '緊急度', '担当者', '出来事', '気づき', 'メモ'],
      ...filteredEntries.map(entry => [
        entry.date,
        entry.user?.line_username || '',
        entry.emotion,
        entry.urgency_level || '',
        entry.assigned_counselor || '未割り当て',
        `"${entry.event.replace(/"/g, '""')}"`,
        `"${entry.realization.replace(/"/g, '""')}"`,
        `"${(entry.counselor_memo || '').replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    // UTF-8エンコーディングを明示的に指定
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `感情日記検索結果_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.emotion) count++;
    if (filters.urgency) count++;
    if (filters.counselor) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.userSearch.trim()) count++;
    if (filters.hasNotes !== null) count++;
    if (filters.scoreRange.selfEsteemMin > 0 || filters.scoreRange.selfEsteemMax < 100 ||
        filters.scoreRange.worthlessnessMin > 0 || filters.scoreRange.worthlessnessMax < 100) count++;
    return count;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      '恐怖': 'bg-purple-100 text-purple-800 border-purple-200',
      '悲しみ': 'bg-blue-100 text-blue-800 border-blue-200',
      '怒り': 'bg-red-100 text-red-800 border-red-200',
      '悔しい': 'bg-green-100 text-green-800 border-green-200',
      '無価値感': 'bg-gray-100 text-gray-800 border-gray-300',
      '罪悪感': 'bg-orange-100 text-orange-800 border-orange-200',
      '寂しさ': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      '恥ずかしさ': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colorMap[emotion] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyColor = (urgency: string) => {
    const urgencyLevel = urgencyLevels.find(level => level.value === urgency);
    return urgencyLevel?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* 検索ヘッダー */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
          <div>
            <h2 className="text-2xl font-jp-bold text-gray-900 mb-2">高度な検索・フィルター</h2>
            <p className="text-gray-600 font-jp-normal text-sm">
              詳細な条件で日記を検索・分析できます
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-jp-medium text-gray-700">
              {filteredEntries.length}件 / {entries.length}件
            </span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-jp-medium">
                {getActiveFilterCount()}個のフィルター適用中
              </span>
            )}
          </div>
        </div>

        {/* 基本検索 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                placeholder="出来事、気づき、メモを検索..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-jp-medium transition-colors ${
                isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>詳細フィルター</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg font-jp-medium hover:bg-red-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>クリア</span>
              </button>
            )}
          </div>
        </div>

        {/* 詳細フィルター */}
        {isExpanded && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            {/* 基本フィルター */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">感情</label>
                <select
                  value={filters.emotion}
                  onChange={(e) => setFilters({...filters, emotion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                >
                  <option value="">すべて</option>
                  {emotions.map((emotion) => (
                    <option key={emotion} value={emotion}>{emotion}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">緊急度</label>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters({...filters, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                >
                  <option value="">すべて</option>
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">担当カウンセラー</label>
                <select
                  value={filters.counselor}
                  onChange={(e) => setFilters({...filters, counselor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                >
                  <option value="">すべて</option>
                  {counselors.map((counselor) => (
                    <option key={counselor} value={counselor}>{counselor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">メモの有無</label>
                <select
                  value={filters.hasNotes === null ? '' : filters.hasNotes.toString()}
                  onChange={(e) => setFilters({
                    ...filters, 
                    hasNotes: e.target.value === '' ? null : e.target.value === 'true'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                >
                  <option value="">すべて</option>
                  <option value="true">メモあり</option>
                  <option value="false">メモなし</option>
                </select>
              </div>
            </div>

            {/* 日付範囲とユーザー検索 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">開始日</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {...filters.dateRange, start: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">終了日</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {...filters.dateRange, end: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-jp-medium text-gray-700 mb-2">ユーザー検索</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={filters.userSearch}
                    onChange={(e) => setFilters({...filters, userSearch: e.target.value})}
                    placeholder="ユーザー名で検索"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-jp-normal text-sm"
                  />
                </div>
              </div>
            </div>

            {/* スコア範囲フィルター */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-jp-bold text-gray-900 mb-4">スコア範囲フィルター（無価値感のみ）</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                    自己肯定感: {filters.scoreRange.selfEsteemMin} - {filters.scoreRange.selfEsteemMax}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.scoreRange.selfEsteemMin}
                      onChange={(e) => setFilters({
                        ...filters,
                        scoreRange: {...filters.scoreRange, selfEsteemMin: parseInt(e.target.value)}
                      })}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.scoreRange.selfEsteemMax}
                      onChange={(e) => setFilters({
                        ...filters,
                        scoreRange: {...filters.scoreRange, selfEsteemMax: parseInt(e.target.value)}
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-jp-medium text-gray-700 mb-2">
                    無価値感: {filters.scoreRange.worthlessnessMin} - {filters.scoreRange.worthlessnessMax}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.scoreRange.worthlessnessMin}
                      onChange={(e) => setFilters({
                        ...filters,
                        scoreRange: {...filters.scoreRange, worthlessnessMin: parseInt(e.target.value)}
                      })}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.scoreRange.worthlessnessMax}
                      onChange={(e) => setFilters({
                        ...filters,
                        scoreRange: {...filters.scoreRange, worthlessnessMax: parseInt(e.target.value)}
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 検索条件の保存・読み込み */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
                <h4 className="font-jp-bold text-gray-900">検索条件の保存・読み込み</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSaveSearch(!showSaveSearch)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-jp-medium text-sm transition-colors"
                  >
                    現在の条件を保存
                  </button>
                  <button
                    onClick={exportResults}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-jp-medium text-sm transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV出力</span>
                  </button>
                </div>
              </div>

              {showSaveSearch && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="検索条件名を入力"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-jp-normal text-sm"
                    />
                    <button
                      onClick={saveCurrentSearch}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-jp-medium text-sm transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setShowSaveSearch(false)}
                      className="text-gray-500 hover:text-gray-700 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {savedSearches.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-jp-medium text-gray-700">保存された検索条件</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <button
                          onClick={() => loadSavedSearch(search.filters)}
                          className="flex-1 text-left text-sm font-jp-normal text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          {search.name}
                        </button>
                        <button
                          onClick={() => deleteSavedSearch(search.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-jp-bold text-gray-900">検索結果</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>表示: {filteredEntries.length}件</span>
            {filteredEntries.length !== entries.length && (
              <span>/ 全体: {entries.length}件</span>
            )}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-jp-medium text-gray-500 mb-2">
              検索結果がありません
            </h3>
            <p className="text-gray-400 font-jp-normal">
              検索条件を変更してお試しください
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-jp-medium border ${getEmotionColor(entry.emotion)}`}>
                      {entry.emotion}
                    </span>
                    <span className="text-gray-900 font-jp-medium">
                      {entry.user?.line_username || 'Unknown User'}
                    </span>
                    <span className="text-gray-500 text-sm font-jp-normal">
                      {formatDate(entry.date)}
                    </span>
                    {entry.urgency_level && (
                      <span className={`text-sm font-jp-medium ${getUrgencyColor(entry.urgency_level)}`}>
                        緊急度: {urgencyLevels.find(l => l.value === entry.urgency_level)?.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-jp-normal">
                      {entry.assigned_counselor || '未割り当て'}
                    </span>
                    <button
                      onClick={() => onViewEntry(entry)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="詳細"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShowDeleteConfirm(entry.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-jp-semibold text-gray-700 mb-1 text-sm">出来事</h4>
                    <p className="text-gray-600 text-sm font-jp-normal leading-relaxed line-clamp-2">
                      {entry.event.length > 100 ? `${entry.event.substring(0, 100)}...` : entry.event}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-jp-semibold text-gray-700 mb-1 text-sm">気づき</h4>
                    <p className="text-gray-600 text-sm font-jp-normal leading-relaxed line-clamp-2">
                      {entry.realization.length > 100 ? `${entry.realization.substring(0, 100)}...` : entry.realization}
                    </p>
                  </div>
                </div>

                {entry.counselor_memo && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                    <h4 className="font-jp-semibold text-blue-900 mb-1 text-sm">カウンセラーメモ</h4>
                    <p className="text-blue-800 text-sm font-jp-normal leading-relaxed">
                      {entry.counselor_memo.length > 150 ? `${entry.counselor_memo.substring(0, 150)}...` : entry.counselor_memo}
                    </p>
                  </div>
                )}

                {entry.emotion === '無価値感' && (entry.self_esteem_score || entry.worthlessness_score) && (
                  <div className="flex space-x-6 text-sm bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 font-jp-medium">自己肯定感:</span>
                      <span className="font-jp-semibold text-blue-600">
                        {entry.self_esteem_score || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 font-jp-medium">無価値感:</span>
                      <span className="font-jp-semibold text-red-600">
                        {entry.worthlessness_score || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-jp-bold text-gray-900">日記を削除</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 border border-red-200 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-jp-bold text-red-900">警告</h3>
                </div>
                <p className="text-red-800 font-jp-normal">
                  この日記エントリーを削除しますか？この操作は取り消せません。
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-jp-medium transition-colors"
                >
                  削除する
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-jp-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilter;