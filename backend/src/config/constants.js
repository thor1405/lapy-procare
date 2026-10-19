export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN',
};

export const REPAIR_STATUS = {
  BOOKING_RECEIVED: 'Booking Received',
  DEVICE_RECEIVED: 'Device Received',
  DIAGNOSIS_IN_PROGRESS: 'Diagnosis in Progress',
  AWAITING_CUSTOMER_APPROVAL: 'Awaiting Customer Approval',
  REPAIR_APPROVED: 'Repair Approved',
  REPAIR_IN_PROGRESS: 'Repair in Progress',
  TESTING_QUALITY_CHECK: 'Testing & Quality Check',
  READY_FOR_COLLECTION: 'Ready for Collection',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const REPAIR_STATUS_ORDER = [
  REPAIR_STATUS.BOOKING_RECEIVED,
  REPAIR_STATUS.DEVICE_RECEIVED,
  REPAIR_STATUS.DIAGNOSIS_IN_PROGRESS,
  REPAIR_STATUS.AWAITING_CUSTOMER_APPROVAL,
  REPAIR_STATUS.REPAIR_APPROVED,
  REPAIR_STATUS.REPAIR_IN_PROGRESS,
  REPAIR_STATUS.TESTING_QUALITY_CHECK,
  REPAIR_STATUS.READY_FOR_COLLECTION,
  REPAIR_STATUS.COMPLETED,
  REPAIR_STATUS.CANCELLED,
];

export const SERVICE_PREFERENCE = {
  DROP_OFF: 'Drop off at service center',
  DOORSTEP: 'Request doorstep service',
};

export const DEVICE_TYPES = {
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop',
  GAMING_PC: 'Gaming PC',
  OTHER: 'Other',
};

export const PAYMENT_STATUS = {
  UNPAID: 'Unpaid',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
};

export const PAYMENT_METHOD = {
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  ONLINE_RAZORPAY: 'Online (Razorpay)',
  BANK_TRANSFER: 'Bank Transfer',
};

export const QUOTATION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

export const PC_BUILD_USE_CASES = [
  'Gaming',
  'Office',
  'Video Editing',
  'Programming',
  'Graphic Design',
  'Workstation',
];

export const COMPONENT_CATEGORIES = [
  'Processor',
  'Motherboard',
  'RAM',
  'Graphics Card',
  'Storage',
  'Power Supply',
  'Cabinet',
  'Cooling',
];
