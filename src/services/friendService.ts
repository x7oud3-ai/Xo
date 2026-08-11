import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Friendship } from '../types';

export async function searchUserByUsername(username: string): Promise<UserProfile | null> {
  const cleanUsername = username.trim().toLowerCase().replace('@', '');
  if (!cleanUsername) return null;

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('usernameLower', '==', cleanUsername));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs[0].data() as UserProfile;
  }
  return null;
}

export async function sendFriendRequest(fromUid: string, toUid: string): Promise<string> {
  if (fromUid === toUid) throw new Error('لا يمكنك إضافة نفسك كصديق');

  // Check if friendship already exists
  const friendshipsRef = collection(db, 'friendships');
  const q1 = query(friendshipsRef, where('user1', '==', fromUid), where('user2', '==', toUid));
  const q2 = query(friendshipsRef, where('user1', '==', toUid), where('user2', '==', fromUid));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  if (!snap1.empty || !snap2.empty) {
    throw new Error('توجد طلب صداقة بالفعل أو أنتما أصدقاء بالفعل');
  }

  const friendshipId = `${fromUid}_${toUid}`;
  await setDoc(doc(db, 'friendships', friendshipId), {
    id: friendshipId,
    user1: fromUid,
    user2: toUid,
    status: 'pending',
    requestedBy: fromUid,
    createdAt: serverTimestamp(),
  });

  return friendshipId;
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const ref = doc(db, 'friendships', friendshipId);
  await updateDoc(ref, {
    status: 'accepted',
  });
}

export async function getFriendsList(uid: string): Promise<{ friendship: Friendship; friendProfile: UserProfile }[]> {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const q1 = query(friendshipsRef, where('user1', '==', uid), where('status', '==', 'accepted'));
    const q2 = query(friendshipsRef, where('user2', '==', uid), where('status', '==', 'accepted'));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const friendships: Friendship[] = [];

    snap1.forEach((d) => friendships.push(d.data() as Friendship));
    snap2.forEach((d) => friendships.push(d.data() as Friendship));

    const result = await Promise.all(
      friendships.map(async (fs) => {
        const friendUid = fs.user1 === uid ? fs.user2 : fs.user1;
        const friendDoc = await getDoc(doc(db, 'users', friendUid));
        const friendProfile = (friendDoc.exists() ? friendDoc.data() : null) as UserProfile;
        return { friendship: fs, friendProfile };
      })
    );

    return result.filter((item) => item.friendProfile !== null);
  } catch (err) {
    console.error('Error fetching friends list:', err);
    return [];
  }
}

export async function getPendingFriendRequests(uid: string): Promise<{ friendship: Friendship; requesterProfile: UserProfile }[]> {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const q = query(friendshipsRef, where('user2', '==', uid), where('status', '==', 'pending'));
    const snap = await getDocs(q);

    const pendingList: Friendship[] = [];
    snap.forEach((d) => pendingList.push(d.data() as Friendship));

    const result = await Promise.all(
      pendingList.map(async (fs) => {
        const requesterDoc = await getDoc(doc(db, 'users', fs.requestedBy));
        const requesterProfile = (requesterDoc.exists() ? requesterDoc.data() : null) as UserProfile;
        return { friendship: fs, requesterProfile };
      })
    );

    return result.filter((item) => item.requesterProfile !== null);
  } catch (err) {
    console.error('Error fetching pending friend requests:', err);
    return [];
  }
}
