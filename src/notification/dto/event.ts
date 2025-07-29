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
}

export interface SendEmailEventData {
  from?: string;
  to: string;
  subject: string;
  context: Record<string, any>;
}

export class SendEmailEvent {
  constructor(public data: SendEmailEventData) { }
}
