export interface SendEmailEventData {
  to: string;
  subject: string;
  html: string;
}

export class SendEmailEvent {
  constructor(public data: SendEmailEventData) {}
}
