export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ngo_auth_token',
  AUTH_USER:  'ngo_auth_user',
  NGO_CONFIG: 'ngo_config',
} as const;

export const DESIGNATIONS = [
  { value: 'member',     label: 'Member' },
  { value: 'volunteer',  label: 'Volunteer' },
  { value: 'secretary',  label: 'Secretary' },
  { value: 'president',  label: 'President' },
  { value: 'admin',      label: 'Admin' },
] as const;

export const DONATION_STATUS_LABELS: Record<string, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const ID_CARD_STATUS_LABELS: Record<string, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const OTP_RESEND_SECONDS = 60;
export const MAX_FILE_SIZE_MB   = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
