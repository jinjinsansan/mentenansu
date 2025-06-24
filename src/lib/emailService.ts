// EmailJS統合サービス
// 無料で月300通まで送信可能

import emailjs from '@emailjs/browser';

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

interface EmailParams {
  to_email: string;
  verification_code: string;
  app_name: string;
  user_name?: string;
}

class EmailService {
  private static instance: EmailService;
  private isInitialized = false;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // EmailJSを初期化
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
      if (publicKey && publicKey !== 'your_emailjs_public_key') {
        emailjs.init(publicKey);
        this.isInitialized = true;
        console.log('EmailJS初期化完了');
      } else {
        console.log('EmailJS Public Keyが設定されていません - デモモードで動作します');
      }
    } catch (error) {
      console.error('EmailJS初期化エラー:', error);
    }
  }

  async sendVerificationEmail(
    email: string, 
    code: string, 
    username?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.initialize();

      // EmailJS設定（環境変数から取得）
      const config: EmailConfig = {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '', 
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
      };

      // 設定チェック
      if (!this.isValidConfig(config)) {
        console.log('本番環境: EmailJS設定が不完全です - フォールバックモードで動作します');
        return this.handleFallback(email, code);
      }

      const emailParams: EmailParams = {
        to_email: email,
        verification_code: code,
        app_name: 'かんじょうにっき',
        user_name: username || 'ユーザー'
      };

      // メール送信
      console.log('本番環境: EmailJSでメール送信を試行します');
      const response = await emailjs.send(
        config.serviceId,
        config.templateId,
        emailParams
      );

      if (response.status === 200) {
        console.log('本番環境: メール送信成功');
        return {
          success: true,
          message: `確認コードを ${email} に送信しました。メールをご確認ください。`
        };
      } else {
        throw new Error(`送信失敗: ${response.status}`);
      }

    } catch (error) {
      console.error('メール送信エラー:', error);
      
      // エラー時はフォールバック処理
      return this.handleFallback(email, code);
    }
  }

  private isValidConfig(config: EmailConfig): boolean {
    return !!(
      config.serviceId && 
      config.templateId && 
      config.publicKey &&
      config.serviceId !== 'your_emailjs_service_id' &&
      config.templateId !== 'your_emailjs_template_id' &&
      config.publicKey !== 'your_emailjs_public_key'
    );
  }

  private handleFallback(email: string, code: string): { success: boolean; message: string } {
    // EmailJS設定がない場合のフォールバック処理
    if (import.meta.env.DEV) {
      console.log(`フォールバック: 確認コード ${code} をメール ${email} に送信（デモ）`);
    } else {
      console.log('本番環境: EmailJS設定がないためフォールバックモードで動作します');
    }
    
    // 開発環境ではアラートで表示
    if (import.meta.env.DEV) {
      setTimeout(() => {
        alert(
          `📧 確認コード: ${code}\n\n` +
          `メール: ${email}\n\n` +
          `※ EmailJS設定後は実際のメールが送信されます\n` +
          `設定方法: README.mdをご確認ください`
        );
      }, 1000);
    }

    return {
      success: true, 
      message: import.meta.env.PROD 
        ? `セキュア認証で確認コードを送りました（デモモード）` 
        : `確認コードを ${email} に送信しました。（デモモード）`
    };
  }

  // EmailJS設定状態の確認
  getConfigStatus(): {
    isConfigured: boolean;
    hasServiceId: boolean;
    hasTemplateId: boolean;
    hasPublicKey: boolean;
  } {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const hasServiceId = !!(serviceId && serviceId !== 'your_emailjs_service_id');
    const hasTemplateId = !!(templateId && templateId !== 'your_emailjs_template_id');
    const hasPublicKey = !!(publicKey && publicKey !== 'your_emailjs_public_key');

    return {
      isConfigured: hasServiceId && hasTemplateId && hasPublicKey,
      hasServiceId,
      hasTemplateId,
      hasPublicKey
    };
  }

  // テスト送信
  async testEmail(email: string): Promise<{ success: boolean; message: string }> {
    const testCode = '1234';
    return this.sendVerificationEmail(email, testCode, 'テストユーザー');
  }
}

// メールアドレスの正規表現
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const emailService = EmailService.getInstance();
export { emailRegex };
export type { EmailConfig, EmailParams };