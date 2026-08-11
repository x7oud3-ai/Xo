import React, { useState } from 'react';
import { updateUserProfile } from '../services/userService';
import { PRESET_AVATARS, convertFileToBase64 } from '../data/avatars';
import { uploadImageToImgBB } from '../services/uploadService';
import { soundFx } from '../lib/audio';
import { UserProfile } from '../types';
import {
  User,
  Sparkles,
  Trophy,
  Award,
  Upload,
  Edit2,
  Check,
  ArrowRight,
  ShieldCheck,
  Mail,
  AtSign,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onBack }) => {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        setMsg('جاري رفع الصورة إلى سيرفرات ImgBB...');
        const imageUrl = await uploadImageToImgBB(file);
        setPhotoURL(imageUrl);
        setMsg('تم رفع الصورة بنجاح!');
        soundFx.playClick();
      } catch (err) {
        setMsg('تعذر رفع الصورة');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    soundFx.playClick();
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL,
      });
      onUpdateUser({
        ...user,
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL,
      });
      setMsg('تم حفظ التغييرات بنجاح!');
      setEditing(false);
    } catch (err) {
      setMsg('فشل حفظ البيانات');
    } finally {
      setLoading(false);
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
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#F0F0F0]">Player Profile</h2>
            <p className="text-xs text-[#888] uppercase tracking-widest">إحصائياتك الشاملة وبيانات حسابك</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-[#1A1A1C] border border-[#D4AF37]/30 text-[#D4AF37] text-xs">
          {msg}
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-[#0F0F11] border border-[#D4AF37]/20 p-6 relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar Upload */}
          <div className="relative group shrink-0">
            <img
              src={photoURL}
              alt={user.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] shadow-xl"
            />
            {editing && (
              <label className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-[#D4AF37]" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="text-center sm:text-right flex-1 space-y-1">
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-[#0A0A0B] border border-[#D4AF37]/40 text-[#F0F0F0] font-bold text-base px-3 py-1.5 w-full focus:outline-none"
              />
            ) : (
              <h3 className="text-xl font-serif font-bold text-[#F0F0F0] flex items-center justify-center sm:justify-start gap-3">
                <span>{user.displayName}</span>
                <span className="text-[#D4AF37] text-xs font-serif bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30">
                  {user.points} pts
                </span>
              </h3>
            )}

            <p className="text-xs text-[#D4AF37] font-medium dir-ltr text-right">@{user.username}</p>
            <p className="text-xs text-[#888] flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-[#666]" />
              <span>{user.email}</span>
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              if (editing) handleSave();
              else setEditing(true);
            }}
            disabled={loading}
            className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-[#B8962D] transition-colors"
          >
            {editing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{editing ? 'حفظ التغييرات' : 'تعديل البروفايل'}</span>
          </button>
        </div>

        {/* Bio */}
        <div className="border-t border-[#D4AF37]/10 pt-4">
          <label className="block text-[11px] font-semibold text-[#888] mb-1 uppercase tracking-widest">النبذة الشخصية:</label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#D4AF37]/30 text-[#F0F0F0] text-xs p-3 focus:outline-none"
              rows={2}
            />
          ) : (
            <p className="text-xs text-[#E0E0E0] leading-relaxed bg-[#1A1A1C] p-3 border border-[#222]">
              {user.bio || 'لاعب شغوف في لعبة X O!'}
            </p>
          )}
        </div>

        {/* Preset Avatars when editing */}
        {editing && (
          <div className="space-y-2 border-t border-[#D4AF37]/10 pt-4">
            <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-widest">اختر صورة مجهزة أخرى:</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((av) => (
                <img
                  key={av.id}
                  src={av.url}
                  alt={av.name}
                  onClick={() => {
                    setPhotoURL(av.url);
                    soundFx.playClick();
                  }}
                  className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 ${
                    photoURL === av.url ? 'border-[#D4AF37] scale-105' : 'border-[#222] opacity-60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#0F0F11] border border-[#D4AF37]/10 text-center space-y-1">
          <div className="text-2xl font-serif font-bold text-emerald-400">{user.wins}</div>
          <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider">الانتصارات</div>
        </div>

        <div className="p-4 bg-[#0F0F11] border border-[#D4AF37]/10 text-center space-y-1">
          <div className="text-2xl font-serif font-bold text-red-400">{user.losses}</div>
          <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider">الهزائم</div>
        </div>

        <div className="p-4 bg-[#0F0F11] border border-[#D4AF37]/10 text-center space-y-1">
          <div className="text-2xl font-serif font-bold text-[#D4AF37]">{user.draws}</div>
          <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider">التعادلات</div>
        </div>

        <div className="p-4 bg-[#0F0F11] border border-[#D4AF37]/10 text-center space-y-1">
          <div className="text-2xl font-serif font-bold text-[#F0F0F0]">{winRate}%</div>
          <div className="text-[11px] text-[#888] font-bold uppercase tracking-wider">نسبة الفوز</div>
        </div>
      </div>
    </div>
  );
};
