import { AdminUser } from "@common/types";

export interface LogActionEventData {
  administrator: AdminUser;
  action: string;
}


export class LogActionEvent {
  constructor(public data: LogActionEventData) {}
}

export const AuditLogEvents = Object.freeze({
  UserActivity: 'user.activity',
})