import React, { useState, useEffect } from 'react';
import {
  searchUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendsList,
  getPendingFriendRequests,
} from '../services/friendService';
import { createOnlineRoom, sendGameInvite } from '../services/gameService';
import { soundFx } from '../lib/audio';
import { UserProfile, Friendship } from '../types';
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Swords,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Circle,
} from 'lucide-react';

interface FriendsViewProps {
  user: UserProfile;
  onStartRoomWithInvite: (roomId: string) => void;
  onBack: () => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  user,
  onStartRoomWithInvite,
  onBack,
}) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const [friends, setFriends] = useState<{ friendship: Friendship; friendProfile: UserProfile }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ friendship: Friendship; requesterProfile: UserProfile }[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [inviteSentForUid, setInviteSentForUid] = useState<string | null>(null);

  useEffect(() => {
    loadFriendsData();
  }, [user.uid]);

  const loadFriendsData = async () => {
    setLoadingList(true);
    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriendsList(user.uid),
        getPendingFriendRequests(user.uid),
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
    } catch (err) {
      console.error('Error loading friends data:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setSearching(true);
    setSearchMsg(null);
    setSearchResult(null);
    soundFx.playClick();

    try {
      const found = await searchUserByUsername(searchUsername);
      if (found) {
        if (found.uid === user.uid) {
          setSearchMsg('هذا يوزر نيم حسابك الحالي');
        } else {
          setSearchResult(found);
        }
      } else {
        setSearchMsg('لم يتم العثور على أي لاعب بهذا اليوزر نيم');
      }
    } catch (err) {
      setSearchMsg('حدث خطأ أثناء البحث');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (targetUid: string) => {
    soundFx.playClick();
    try {
      await sendFriendRequest(user.uid, targetUid);
      setSearchMsg('تم إرسال طلب الصداقة بنجاح!');
      setSearchResult(null);
      loadFriendsData();
    } catch (err: any) {
      setSearchMsg(err.message || 'فشل إرسال طلب الصداقة');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    soundFx.playClick();
    try {
      await acceptFriendRequest(friendshipId);
      loadFriendsData();
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Invite friend to play game
  const handleInviteToPlay = async (friendProfile: UserProfile) => {
    soundFx.playClick();
    try {
      // 1. Create online room
      const roomId = await createOnlineRoom(user, false);
      // 2. Send invitation document to target user
      await sendGameInvite(user, friendProfile.uid, roomId);

      setInviteSentForUid(friendProfile.uid);
      setTimeout(() => setInviteSentForUid(null), 3000);

      // 3. Switch inviting user into room view
      onStartRoomWithInvite(roomId);
    } catch (err) {
      console.error('Error sending invite:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="px-4 py-2 bg-[#1A1A1C] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[#D4AF37] bg-[#1A1A1C] flex items-center justify-center text-[#D4AF37]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">Friends & Social</h2>
            <p className="text-xs text-[#888] uppercase tracking-widest">ابحث باليوزر نيم وأرسل دعوة للعب أونلاين</p>
          </div>
        </div>
      </div>

      {/* Search by Username Form */}
      <div className="bg-[#0F0F11] border border-[#D4AF37]/20 p-5 space-y-4">
        <h3 className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
          <Search className="w-4 h-4 text-[#D4AF37]" />
          <span>إضافة صديق عن طريق اليوزر نيم:</span>
        </h3>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="ادخل اليوزر نيم (مثال: ahmed_pro)..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="flex-1 bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-xs px-3.5 py-3 focus:outline-none focus:border-[#D4AF37] ltr text-left"
          />
          <button
            type="submit"
            disabled={searching || !searchUsername.trim()}
            className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-widest hover:bg-[#B8962D] transition-all cursor-pointer disabled:opacity-50"
          >
            {searching ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>

        {searchMsg && (
          <div className="p-3 bg-[#1A1A1C] border border-[#D4AF37]/30 text-xs text-[#D4AF37]">
            {searchMsg}
          </div>
        )}

        {searchResult && (
          <div className="bg-[#1A1A1C] border border-[#D4AF37]/50 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={searchResult.photoURL} alt={searchResult.displayName} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/40" />
              <div>
                <h4 className="text-xs font-bold text-[#F0F0F0]">{searchResult.displayName}</h4>
                <p className="text-[10px] text-[#D4AF37]">@{searchResult.username}</p>
              </div>
            </div>

            <button
              onClick={() => handleAddFriend(searchResult.uid)}
              className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة كصديق</span>
            </button>
          </div>
        )}
      </div>

      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3 bg-[#0F0F11] border border-[#D4AF37]/30 p-5">
          <h3 className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>طلبات الصداقة الواردة ({pendingRequests.length}):</span>
          </h3>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.friendship.id}
                className="bg-[#1A1A1C] border border-[#222] p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={req.requesterProfile.photoURL} alt={req.requesterProfile.displayName} className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]/30" />
                  <div>
                    <h4 className="text-xs font-bold text-[#F0F0F0]">{req.requesterProfile.displayName}</h4>
                    <p className="text-[10px] text-[#888]">@{req.requesterProfile.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptRequest(req.friendship.id)}
                  className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>قبول الطلب</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-3">
        <h3 className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-widest flex items-center justify-between border-b border-[#D4AF37]/10 pb-2">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span>قائمة أصدقائك ({friends.length}):</span>
          </span>
        </h3>

        {loadingList ? (
          <div className="p-8 text-center text-[#888] text-xs uppercase tracking-widest">جاري تحميل قائمة الأصدقاء...</div>
        ) : friends.length > 0 ? (
          <div className="space-y-2">
            {friends.map(({ friendProfile }) => (
              <div
                key={friendProfile.uid}
                className="bg-[#0F0F11] border border-[#D4AF37]/10 p-4 flex items-center justify-between gap-3 hover:border-[#D4AF37]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={friendProfile.photoURL}
                      alt={friendProfile.displayName}
                      className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]/30"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0A0B] ${
                        friendProfile.isOnline ? 'bg-emerald-500' : 'bg-[#555]'
                      }`}
                      title={friendProfile.isOnline ? 'متصل الآن' : 'غير متصل'}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#F0F0F0] flex items-center gap-2">
                      <span>{friendProfile.displayName}</span>
                      <span className="text-[10px] text-[#D4AF37] font-serif">({friendProfile.points} pts)</span>
                    </h4>
                    <p className="text-[10px] text-[#666]">@{friendProfile.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleInviteToPlay(friendProfile)}
                  disabled={inviteSentForUid === friendProfile.uid}
                  className="px-4 py-2.5 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider hover:bg-[#B8962D] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>{inviteSentForUid === friendProfile.uid ? 'تم إرسال الدعوة...' : 'أرسل دعوة أونلاين'}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0F0F11] border border-[#D4AF37]/10 text-[#888] text-xs uppercase tracking-widest space-y-2">
            <p>لا يوجد أصدقاء في قائمتك حالياً.</p>
            <p className="text-[11px] text-[#666]">ابحث عن أصدقائك عبر اليوزر نيم لإضافتهم والتحدي معهم أونلاين!</p>
          </div>
        )}
      </div>
    </div>
  );
};
