export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum UserRole {
  Agent = 'Agent',
  Corporate = 'Corporate',
  Facility = 'Facility',
  Resident = 'Resident',
}

export enum SmartBinApplicationStatus {
  Pending = 'pending',
  Delivered = 'delivered',
  ScheduledForDelivery = 'Scheduled for Delivery',
  Inventory = 'Inventory',
  Activated = 'Activated',
}

export enum PickupStatus {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum AccountStatus {
  Active = 'active',
  Inactive = 'inactive',
}
