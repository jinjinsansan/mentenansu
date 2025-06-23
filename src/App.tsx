import React, { useState, useEffect } from 'react';
import { Calendar, Search, TrendingUp, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Menu, X, BookOpen, Play, ArrowRight, Home, Heart, Share2, Shield, Settings, MessageCircle, Database, LogIn } from 'lucide-react';
import PrivacyConsent from './components/PrivacyConsent';
import MaintenanceMode from './components/MaintenanceMode';
import { useMaintenanceStatus } from './hooks/useMaintenanceStatus';
import LineAuthGuard from './components/LineAuthGuard';
import AuthCallback from './pages/AuthCallback';
import DiaryPage from './pages/DiaryPage';
import DiarySearchPage from './pages/DiarySearchPage';
import HowTo from './pages/HowTo';
import FirstSteps from './pages/FirstSteps';
import NextSteps from './pages/NextSteps';
import EmotionTypes from './pages/EmotionTypes';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { useSupabase } from './hooks/useSupabase';
import { useAutoSync } from './hooks/useAutoSync';
import { checkAuthStatus } from './lib/lineAuth';

interface JournalEntry {
  id: string;
  date: string;
  emotion: string;
  event: string;
  realization: string;
  selfEsteemScore: number;
  worthlessnessScore: number;
}

const App: React.FC = () => {
  // ... [rest of the code remains exactly the same until the end]
  return (
    <LineAuthGuard>
      {lineAuthEnabled ? (
        <AuthCallback>
          {/* ... [rest of the JSX remains exactly the same] */}
        </AuthCallback>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* ... [rest of the JSX remains exactly the same] */}
        </div>
      )}
    </LineAuthGuard>
  );
};

export default App;