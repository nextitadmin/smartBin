export const MailNotificationEvents = Object.freeze({
  Account: {
    ForgotPassword: 'password.forgot.account',
    VerificatonCode: 'verification.code.account',
    PayerGenerated: 'generated.payer.account',
    VerificationOTP: 'verificaton.otp.account',
    Welcome: 'welcome.account',
  },
});

export enum Templates {
  ForgotPassword = 'forgot-password',
  LoginCode = 'login-code',
  PayerGenerated = 'payer-generated',
  VerifyOTP = 'verify-otp',
  Welcome = 'welcome',
}

export interface SendEmailEventData {
  from?: string;
  to: string;
  subject: string;
  context: Record<string, any>;
}

export class SendEmailEvent {
  constructor(public data: SendEmailEventData) {}
}
