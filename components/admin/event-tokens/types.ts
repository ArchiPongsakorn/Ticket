export type Attendee = {
  id: string;
  name: string;
  type: string;
  tokens: number;
  checkedIn: boolean;
  email?: string;
  ownerEmail?: string;
  orderId?: string;
  active?: boolean;
};

export type ActivityLog = {
  id: number;
  time: string;
  message: string;
  type: string;
  storeId?: string;
  storeName?: string;
  tokenAmount?: number;
};

export type AddLog = (
  message: string,
  type?: string,
  auditAction?: string,
  sale?: { storeId: string; storeName: string; tokenAmount: number },
) => void;
