import React, { useState } from 'react';
import { Shield, Eye, Lock, Database, AlertTriangle, Users, Clock, MessageCircle } from 'lucide-react';

interface PrivacyConsentProps {
  onConsent: (accepted: boolean) => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onConsent }) => {
  const [isChecked, setIsChecked] = useState(false);
      // 同意履歴を記録
      const consentRecord = {
        id: Date.now().toString(),
        line_username: '', // ユーザー名入力時に更新される
        consent_given: true,
        consent_date: new Date().toISOString(),
        ip_address: 'unknown', // 実際の実装では取得可能
        user_agent: navigator.userAgent
      };
      
      // ローカルストレージに保存
      const existingHistories = localStorage.getItem('consent_histories');
      const histories = existingHistories ? JSON.parse(existingHistories) : [];
      histories.push(consentRecord);
      localStorage.setItem('consent_histories', JSON.stringify(histories));
      
      // Supabaseにも保存（バックグラウンドで）
      if (consentRecord.line_username) {
        consentService.createConsentRecord({
          line_username: consentRecord.line_username,
          consent_given: consentRecord.consent_given,
          consent_date: consentRecord.consent_date,
          ip_address: consentRecord.ip_address,
          user_agent: consentRecord.user_agent
        }).catch(error => {
          console.error('Supabase同意履歴保存エラー:', error);
        });
      }
      
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked) {
      // 拒否履歴を記録
      const consentRecord = {
        id: Date.now().toString(),
        line_username: 'declined_user_' + Date.now(),
        consent_given: false,
        consent_date: new Date().toISOString(),
        ip_address: 'unknown',
        user_agent: navigator.userAgent
      };
      
      // ローカルストレージに保存
      const existingHistories = localStorage.getItem('consent_histories');
      const histories = existingHistories ? JSON.parse(existingHistories) : [];
      histories.push(consentRecord);
      localStorage.setItem('consent_histories', JSON.stringify(histories));
      
      // Supabaseにも保存（バックグラウンドで）
      consentService.createConsentRecord({
        line_username: consentRecord.line_username,
        consent_given: consentRecord.consent_given,
        consent_date: consentRecord.consent_date,
        ip_address: consentRecord.ip_address,
        user_agent: consentRecord.user_agent
      }).catch(error => {
        console.error('Supabase同意履歴保存エラー:', error);
      });
      
      onConsent(true);
    }
  };

  const handleReject = () => {
    onConsent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-jp-bold text-gray-900 mb-2">
            プライバシーに関する重要なお知らせ
          </h1>
          <p className="text-gray-600 font-jp-normal">
            本サービス「かんじょうにっき」では、次の情報を取得し、下記の目的で利用します。
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Database className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 取得する情報</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>・LINEユーザー識別子（userId）</p>
                  <p>・あなたが投稿する「感情日記」の本文（精神・心理状態を含む要配慮個人情報）</p>
                  <p>・投稿日時・端末等の利用メタデータ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 利用目的</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>感情日記サービスの提供および品質向上のため</p>
                  <p>心理カウンセラーによる個別アドバイス・緊急対応のため</p>
                  <p>匿名化・統計化したうえでの研究・サービス改善のため</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-jp-semibold text-gray-900 mb-3">■ 第三者提供について</h3>
                <div className="space-y-2 text-sm text-gray-700">
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsent;
  )
}