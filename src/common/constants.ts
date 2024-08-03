export const events = Object.freeze({
  sendEmail: 'send-email',
  kyc: {
    upgraded: 'kyc.upgraded',
  },
  verification: {
    verified: 'verification.verified',
  },
  beneficiary: {
    added: 'beneficiary.added',
  },
  transactions: {
    updated: 'transaction.updated',
  },
  webhook: {
    requestReceived: 'webhook.request.received',
  },
  bills: {
    purchased: 'bills.purchased',
  },
});

export const cacheKeys = {
  otp: (email: string) => `$$LUMEO_OTP_${email}`,
  customer: (id: number) => `$$LUMEO_CUS_${id}`,
};

export enum EmailTemplates {
  VerifyOtp = 'verify-otp',
  ResetPassword = 'reset-password',
}

export enum SupportedCurrency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
}

export enum TransactionNarrations {
  WalletTopup = 'Wallet Topup',
  BillPayment = 'Bill Payment',
}

export const UtilityBillServiceCategories = [];

export const REMOVE_EXTRA_CHARS_REGEX = /[^\w\s]/gi;

export const defaultAirtimeProviders = [
  {
    label: 'MTN',
    value: 'mtn',
  },
  {
    label: 'GLO',
    value: 'mtn',
  },
  {
    label: 'Airtel',
    value: 'airtel',
  },
  {
    label: '9mobile',
    value: 'etisalat',
  },
];

export const defaultDataProviders = [
  {
    label: 'MTN Data',
    value: 'mtn-data',
  },
  {
    label: 'GLO Data',
    value: 'glo-data',
  },
  {
    label: 'AIRTEL Data',
    value: 'airtel-data',
  },
  {
    label: '9MOBILE Data',
    value: 'etisalat-data',
  },
  {
    label: '9MOBILE SME Data',
    value: '9mobile-sme-data',
  },
  {
    label: 'SMILE Network',
    value: 'smile-direct',
  },
  {
    label: 'SPECTRANET',
    value: 'spectranet',
  },
];

export const defaultUtilityCategories = [
  {
    label: 'IKEDC Ikeja Electric Prepaid',
    value: 'ikeja-electric',
    code: 'BIL113',
    itemCode: 'UB159',
  },
  {
    label: 'EKEDC Eko Electric Prepaid',
    value: 'eko-electric',
    itemCode: 'UB157',
    code: 'BIL112',
  },
  {
    label: 'IBEDC Ibadan Electric Prepaid',
    value: 'ibadan-electric',
    itemCode: 'UB161',
    code: 'BIL114',
  },
  {
    label: 'KEDCO KANO Electric Prepaid',
    value: 'kano-electric',
    itemCode: 'UB169',
    code: 'BIL120',
  },
  // {
  //   label: 'PHED PortHarcout Electric Prepaid',
  //   value: 'portharcourt-electric',
  // },
  {
    label: 'AEDC Abuja Electric Prepaid',
    value: 'abuja-electric',
    itemCode: 'UB584',
    code: 'BIL204',
  },
];
