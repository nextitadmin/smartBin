export const MailNotificationEvents = Object.freeze({
  Account: {
    ForgotPassword: 'password.forgot.account',
    VerificatonCode: 'verification.code.account',
    PayerGenerated: 'generated.payer.account',
    VerificationOTP: 'verificaton.otp.account',
    Welcome: 'welcome.account',
  },
  Application: {
    SmartBinUpdate: 'notification.smartbin.updated',
    LowWalletBalance: 'notification.wallet.low',
    GeneralAppUpdate: 'notification.app.update',
  },
  Support: {
    NewRequest: 'support.new.request',
  },
});

export enum Templates {
  ForgotPassword = 'forgot-password',
  LoginCode = 'login-code',
  PayerGenerated = 'payer-generated',
  VerifyOTP = 'verify-otp',
  Welcome = 'welcome',
  SmartBinUpdate = 'smartbin-update',
  LowWalletBalance = 'low-balance',
  GeneralAppUpdate = 'app-update',
  SupportRequest = 'support-request',
}

export interface SendEmailEventData {
  to: string;
  from: string;
  subject: string;
  context: any;
  replyTo?: string; // ✅ Add this line
}

export class SendEmailEvent {
  constructor(public data: SendEmailEventData) { }
}
