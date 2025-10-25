const Permissions = {
  Dashboard: {
    SmartbinRequests: {},
  },
  KYC: {},
  UserManagement: {},
  PSP: {},
  SmartBinManagement: {},
  WasteManagement: {},
  Revenue: {},
  BillsReceipts: {},
  TeamManagement: {},
  Report: {},
  AdminAccess: {},
  Audits: {},
  ServiceConfiguration: {},
};

const LawmaPermissions = {
  Dashboard: Permissions.Dashboard,
  KYC: Permissions.KYC,
  UserManagement: Permissions.UserManagement,
  PSP: Permissions.PSP,
  SmartBinManagement: Permissions.SmartBinManagement,
  WasteManagement: Permissions.WasteManagement,
  Revenue: Permissions.Revenue,
  BillsReceipts: Permissions.BillsReceipts,
  TeamManagement: Permissions.TeamManagement,
};
export const SmartBinUserPermissions = {
  OrderManagement: ['create', 'view', 'download', 'update', 'delete'],
  TeamManagement: ['create', 'view', 'download', 'update', 'delete'],
  Report: ['create', 'view', 'download', 'update', 'delete'],
  AdminAccess: ['create', 'view', 'download', 'update', 'delete'],
  Audits: ['create', 'view', 'download', 'update', 'delete'],
};

export const PspUserPermissions = {
  WasteManagement: ['create', 'view', 'download', 'update', 'delete'],
  BillsReceipts: ['create', 'view', 'download', 'update', 'delete'],
  TeamManagement: ['create', 'view', 'download', 'update', 'delete'],
  Report: ['create', 'view', 'download', 'update', 'delete'],
  AdminAccess: ['create', 'view', 'download', 'update', 'delete'],
  Audits: ['create', 'view', 'download', 'update', 'delete'],
  ServiceConfiguration: ['create', 'view', 'download', 'update', 'delete'],
};
