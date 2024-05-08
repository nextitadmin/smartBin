export const events = Object.freeze({
  sendEmail: 'send-email',
  kyc: {
    upgraded: 'kyc.upgraded',
  },
  // job: {
  //   dispatched: 'job.dispatched',
  // },
  // offer: {
  //   accepted: 'offer.accepted',
  //   rejected: 'offer.rejected',
  // },
  // loan: {
  //   disbursed: 'loan.disbursed',
  // },
  // disbursement: {
  //   initiated: 'disbursement.initiated',
  //   successful: 'disbursement.successful',
  //   failed: 'disbursement.failed',
  // },
  // payment: {
  //   successful: 'payment.successful',
  //   settled: 'payment.settled',
  // },
  // settlement: {
  //   initiated: 'settlement.initiated',
  //   successful: 'settlement.successful',
  // },
  // downpayment: {
  //   successful: 'downpayment.successful',
  // },
});

// export const workers = Object.freeze({
//   dummy: 'dummy',
//   fetchOffers: 'fetch-offers',
//   fetchMockLenderOffer: 'fetch-mock-lender-offer',
//   checkLoanApplication: 'check-loan-application',
//   paymentStatus: 'payment-status',
//   processLoanApplication: 'process-loan-application',
//   valueSplitProcess: 'value-split-process',
//   monitorDueRepaymentSchedules: 'monitor-due-repayment-schedules',
//   handleDueRepayment: 'handle-due-repayment',
// });

// export type WorkerName = (typeof workers)[keyof typeof workers];

export const cacheKeys = {
  otp: (email: string) => `$$LUMEO_OTP_${email}`,
  customer: (id: number) => `$$LUMEO_CUS_${id}`,
};

export enum EmailTemplates {
  VerifyOtp = 'verify-otp',
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
