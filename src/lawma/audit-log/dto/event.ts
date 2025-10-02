import { AdminUser } from "@common/types";

export interface LogActionEventData {
  administrator: AdminUser;
  action: string;
};

export enum LogStatement {
  UserLoggedIn = 'User Logged In',
  PasswordChanged = 'Password Changed',
  PspAdded = 'Psp Added',
  PspDeactivated = 'Psp Deactivated',
  TeamMemberAdded = 'Team Member Added',
  TeamMemberRemoved = 'Team Member Removed',
  StatusChanged = 'Status Changed',
}


export class LogActionEvent {
  constructor(public data: LogActionEventData) {}
}

export const AuditLogEvents = Object.freeze({
  UserActivity: 'user.activity',
})