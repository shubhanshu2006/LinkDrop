// Common types used across the application

export interface FileData {
  _id: string;
  owner: string;
  originalName: string;
  storageName: string;
  mimeType: string;
  size: number;
  fileType: "normal" | "sensitive" | "verySensitive";
  linkExpiresAt: string;
  allowedEmail?: string;
  openDuration?: number;
  otpVerifiedAt?: string;
  accessEndsAt?: string;
  isOpened: boolean;
  downloadAllowed: boolean;
  offlineAllowed: boolean;
  lastAccessedAt?: string;
  accessCount: number;
  isDisabled: boolean;
  disabledReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}
