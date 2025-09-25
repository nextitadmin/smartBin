import { Request as UserRequest } from 'express';

export interface LogActionEventData {
  userId: string;
  req: UserRequest;
  action: string;
}


export class LogActionEvent {
  constructor(public data: LogActionEventData) {}
}

export const AuditLogEvents = Object.freeze({
  UserActivity: 'user.activity',
})