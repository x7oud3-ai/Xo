import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) return false;

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('usernameLower', '==', cleanUsername));
  const snap = await getDocs(q);
  return snap.empty;
}

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  username: string,
  bio: string = 'لاعب شغوف في لعبة X O!'
): Promise<UserProfile> {
  const cleanUsername = username.trim();
  const usernameLower = cleanUsername.toLowerCase();

  const userProfile: UserProfile = {
    uid,
    email,
    displayName: displayName || 'لاعب X O',
    username: cleanUsername,
    usernameLower,
    photoURL: photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio,
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    isOnline: true,
    achievements: [],
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', uid), {
    ...userProfile,
    lastSeen: serverTimestamp(),
  });

  return userProfile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    ...updates,
    lastSeen: serverTimestamp(),
  });
}

export async function updateUserStats(
  uid: string,
  result: 'win' | 'loss' | 'draw',
  pointsEarned: number,
  newAchievements: string[] = []
): Promise<UserProfile | null> {
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  const newWins = profile.wins + (result === 'win' ? 1 : 0);
  const newLosses = profile.losses + (result === 'loss' ? 1 : 0);
  const newDraws = profile.draws + (result === 'draw' ? 1 : 0);
  const newPoints = Math.max(0, profile.points + pointsEarned);

  const mergedAchievements = Array.from(new Set([...(profile.achievements || []), ...newAchievements]));

  const updates: Partial<UserProfile> = {
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    points: newPoints,
    achievements: mergedAchievements,
  };

  await updateUserProfile(uid, updates);
  return { ...profile, ...updates };
}

export async function getTop10Players(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('points', 'desc'), limit(10));
    const snap = await getDocs(q);
    const players: UserProfile[] = [];
    snap.forEach((docSnap) => {
      players.push(docSnap.data() as UserProfile);
    });
    return players;
  } catch (error) {
    console.error('Error fetching top 10 players:', error);
    return [];
  }
}

export async function setUserOnlineStatus(uid: string, isOnline: boolean) {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error updating online status:', err);
  }
}
