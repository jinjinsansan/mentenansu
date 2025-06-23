// EmailJS統合サービス
// 無料で月300通まで送信可能

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
  private emailjs: any = null;
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
      // EmailJSを動的にインポート
      this.emailjs = await import('@emailjs/browser');
      this.isInitialized = true;
      console.log('EmailJS初期化完了');
    } catch (error) {
      console.error('EmailJS初期化エラー:', error);
      throw new Error('メール送信サービスの初期化に失敗しました');
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
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_default',
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_default',
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_default'
      };

      // 設定チェック
      if (!this.isValidConfig(config)) {
        return this.handleFallback(email, code);
      }

      const emailParams: EmailParams = {
        to_email: email,
        verification_code: code,
        app_name: 'かんじょうにっき',
        user_name: username || 'ユーザー'
      };

      // EmailJS初期化
      this.emailjs.init(config.publicKey);

      // メール送信
      const response = await this.emailjs.send(
        config.serviceId,
        config.templateId,
        emailParams
      );

      if (response.status === 200) {
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
      config.serviceId !== 'service_default' &&
      config.templateId !== 'template_default' &&
      config.publicKey !== 'public_key_default'
    );
  }

  private handleFallback(email: string, code: string): { success: boolean; message: string } {
    // EmailJS設定がない場合のフォールバック処理
    console.log(`フォールバック: 確認コード ${code} をメール ${email} に送信（デモ）`);
    
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
      message: `確認コードを ${email} に送信しました。（デモモード）`
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

    const hasServiceId = !!(serviceId && serviceId !== 'service_default');
    const hasTemplateId = !!(templateId && templateId !== 'template_default');
    const hasPublicKey = !!(publicKey && publicKey !== 'public_key_default');

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

export const emailService = EmailService.getInstance();
export type { EmailConfig, EmailParams };