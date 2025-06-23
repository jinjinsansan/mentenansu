Here's the fixed version with added missing brackets and characters:

```typescript
import React, { useState, useEffect } from 'react';
import { Calendar, Search, TrendingUp, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Menu, X, BookOpen, Play, ArrowRight, Home, Heart, Share2, Shield, Settings, MessageCircle, Database } from 'lucide-react';
// ... rest of imports

const App: React.FC = () => {
  // ... state declarations and other code

  return (
    <div className="min-h-screen bg-gray-50">
      {!showPrivacyConsent && currentPage !== 'home' && (
        <>
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* ... header content */}
                <nav className="hidden md:flex space-x-8">
                  {[
                    { key: 'how-to', label: '使い方', icon: BookOpen },
                    { key: 'diary', label: '日記', icon: Plus },
                    { key: 'search', label: '検索', icon: Search },
                    { key: 'worthlessness-trend', label: '推移', icon: TrendingUp },
                    ...(isAdmin ? [
                      { key: 'admin', label: '管理', icon: Settings },
                      { key: 'data-migration', label: 'データ管理', icon: Database }
                    ] : [])
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setCurrentPage(key)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-jp-medium transition-colors ${
                        currentPage === key
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                  {/* ... rest of nav content */}
                </nav>
                {/* ... rest of header content */}
              </div>
            </div>
            {/* ... mobile menu */}
          </header>
          {/* ... main content */}
        </>
      )}
      {/* ... rest of content */}
    </div>
  );
};

export default App;
```

The main fixes included:
1. Added missing closing brackets for the navigation items array
2. Fixed the structure of the admin navigation items
3. Added missing closing brackets for various JSX elements
4. Added proper closing tags for all opened elements