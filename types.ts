
export enum ActivityType {
  GAME = 'Game',
  RIDE_SHARE = 'Ride Share',
  HANGOUT = 'Hangout',
  STUDY = 'Study',
  EVENT = 'Event',
  OTHER = 'Other'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Participant {
  userId: string;
  userName: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  userId: string;
  userName: string;
  type: ActivityType;
  title: string;
  description: string;
  location: string;
  from?: string;
  to?: string;
  dateTime: string;
  createdAt: string;
  participants?: Participant[];
  comments?: Comment[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
