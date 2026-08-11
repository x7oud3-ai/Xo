export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  usernameLower: string;
  photoURL: string;
  bio?: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  isOnline: boolean;
  lastSeen?: any;
  achievements: string[];
  createdAt?: any;
}

export interface GameRoom {
  id: string;
  hostId: string;
  hostName: string;
  hostPhoto: string;
  hostSymbol: 'X' | 'O';
  guestId: string | null;
  guestName: string | null;
  guestPhoto: string | null;
  guestSymbol: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished' | 'abandoned';
  turn: string; // uid of current player
  board: string[]; // array of 9 strings: '' | 'X' | 'O'
  winningLine: number[] | null;
  winner: string | null; // uid or 'draw' or null
  scores: { [uid: string]: number };
  createdAt: any;
  lastMoveTime?: any;
  isPublic?: boolean;
  messages?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    time: number;
  }>;
}

export interface GameInvite {
  id: string;
  fromUid: string;
  fromName: string;
  fromPhoto: string;
  fromUsername: string;
  toUid: string;
  roomId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

export interface Friendship {
  id: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted';
  requestedBy: string;
  createdAt: any;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsBonus: number;
  requirementType: 'wins' | 'points' | 'streak' | 'ai' | 'online' | 'friends';
  requirementValue: number;
}

export type ActiveTab =
  | 'welcome'
  | 'auth'
  | 'username_setup'
  | 'menu'
  | 'ai'
  | 'local'
  | 'online'
  | 'friends'
  | 'leaderboard'
  | 'achievements'
  | 'profile';
