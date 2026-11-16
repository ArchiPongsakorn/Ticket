export type Attendee = {
  id: string;
  name: string;
  type: string;
  tokens: number;
  checkedIn: boolean;
};

export type ActivityLog = {
  id: number;
  time: string;
  message: string;
  type: string;
};

export type AddLog = (message: string, type?: string) => void;
