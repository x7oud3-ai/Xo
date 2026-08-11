import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GameRoom, GameInvite, UserProfile } from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
];

export function calculateWinner(board: string[]): { winner: 'X' | 'O' | 'draw' | null; winningLine: number[] | null } {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as 'X' | 'O', winningLine: combo };
    }
  }

  const isFull = board.every((cell) => cell !== '');
  if (isFull) {
    return { winner: 'draw', winningLine: null };
  }

  return { winner: null, winningLine: null };
}

export async function createOnlineRoom(host: UserProfile, isPublic: boolean = true): Promise<string> {
  const roomId = 'room_' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const newRoom: GameRoom = {
    id: roomId,
    hostId: host.uid,
    hostName: host.displayName,
    hostPhoto: host.photoURL,
    hostSymbol: 'X',
    guestId: null,
    guestName: null,
    guestPhoto: null,
    guestSymbol: 'O',
    status: 'waiting',
    turn: host.uid,
    board: Array(9).fill(''),
    winningLine: null,
    winner: null,
    scores: { [host.uid]: 0 },
    createdAt: new Date().toISOString(),
    isPublic,
    messages: [],
  };

  await setDoc(doc(db, 'gameRooms', roomId), {
    ...newRoom,
    lastMoveTime: serverTimestamp(),
  });

  return roomId;
}

export async function joinOnlineRoom(roomId: string, guest: UserProfile): Promise<boolean> {
  const roomRef = doc(db, 'gameRooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('الغرفة غير موجودة');
  }

  const data = roomSnap.data() as GameRoom;

  if (data.hostId === guest.uid) {
    return true; // Host re-joining
  }

  if (data.guestId && data.guestId !== guest.uid) {
    throw new Error('الغرفة ممتلئة بالفعل');
  }

  const updatedScores = { ...data.scores, [guest.uid]: data.scores[guest.uid] || 0 };

  await updateDoc(roomRef, {
    guestId: guest.uid,
    guestName: guest.displayName,
    guestPhoto: guest.photoURL,
    status: 'playing',
    scores: updatedScores,
    lastMoveTime: serverTimestamp(),
  });

  return true;
}

export async function makeMoveInRoom(
  roomId: string,
  index: number,
  playerSymbol: 'X' | 'O',
  playerUid: string,
  nextTurnUid: string
): Promise<void> {
  const roomRef = doc(db, 'gameRooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return;
  const room = roomSnap.data() as GameRoom;

  if (room.board[index] !== '' || room.turn !== playerUid || room.status !== 'playing') {
    return;
  }

  const newBoard = [...room.board];
  newBoard[index] = playerSymbol;

  const result = calculateWinner(newBoard);

  let newStatus: GameRoom['status'] = 'playing';
  let newWinnerUid: string | null = null;
  const newScores = { ...room.scores };

  if (result.winner) {
    newStatus = 'finished';
    if (result.winner === 'draw') {
      newWinnerUid = 'draw';
    } else {
      newWinnerUid = result.winner === room.hostSymbol ? room.hostId : room.guestId;
      if (newWinnerUid) {
        newScores[newWinnerUid] = (newScores[newWinnerUid] || 0) + 1;
      }
    }
  }

  await updateDoc(roomRef, {
    board: newBoard,
    winningLine: result.winningLine,
    winner: newWinnerUid,
    status: newStatus,
    turn: nextTurnUid,
    scores: newScores,
    lastMoveTime: serverTimestamp(),
  });
}

export async function resetRoomGame(roomId: string, nextTurnUid: string): Promise<void> {
  const roomRef = doc(db, 'gameRooms', roomId);
  await updateDoc(roomRef, {
    board: Array(9).fill(''),
    winningLine: null,
    winner: null,
    status: 'playing',
    turn: nextTurnUid,
    lastMoveTime: serverTimestamp(),
  });
}

export async function sendQuickMessage(roomId: string, senderId: string, senderName: string, text: string): Promise<void> {
  const roomRef = doc(db, 'gameRooms', roomId);
  const msg = {
    id: 'msg_' + Date.now(),
    senderId,
    senderName,
    text,
    time: Date.now(),
  };

  await updateDoc(roomRef, {
    messages: arrayUnion(msg),
  });
}

export async function sendGameInvite(fromUser: UserProfile, toUid: string, roomId: string): Promise<string> {
  const inviteId = `invite_${fromUser.uid}_${toUid}_${Date.now()}`;
  const invite: GameInvite = {
    id: inviteId,
    fromUid: fromUser.uid,
    fromName: fromUser.displayName,
    fromPhoto: fromUser.photoURL,
    fromUsername: fromUser.username,
    toUid,
    roomId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'invitations', inviteId), {
    ...invite,
    createdAt: serverTimestamp(),
  });

  return inviteId;
}

export async function respondToInvite(inviteId: string, accept: boolean): Promise<GameInvite | null> {
  const ref = doc(db, 'invitations', inviteId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const invite = snap.data() as GameInvite;
  const newStatus = accept ? 'accepted' : 'declined';

  await updateDoc(ref, {
    status: newStatus,
  });

  return { ...invite, status: newStatus };
}

export function subscribeToPublicRooms(callback: (rooms: GameRoom[]) => void) {
  const roomsRef = collection(db, 'gameRooms');
  const q = query(roomsRef, where('isPublic', '==', true), where('status', '==', 'waiting'));

  return onSnapshot(q, (snap) => {
    const rooms: GameRoom[] = [];
    snap.forEach((d) => rooms.push(d.data() as GameRoom));
    callback(rooms);
  });
}

export function subscribeToGameRoom(roomId: string, callback: (room: GameRoom | null) => void) {
  const roomRef = doc(db, 'gameRooms', roomId);
  return onSnapshot(roomRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as GameRoom);
    } else {
      callback(null);
    }
  });
}

export function subscribeToUserInvites(uid: string, callback: (invites: GameInvite[]) => void) {
  const invitesRef = collection(db, 'invitations');
  const q = query(invitesRef, where('toUid', '==', uid), where('status', '==', 'pending'));

  return onSnapshot(q, (snap) => {
    const invites: GameInvite[] = [];
    snap.forEach((d) => invites.push(d.data() as GameInvite));
    callback(invites);
  });
}
