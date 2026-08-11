import { Achievement, UserProfile } from '../types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'الانتصار الأول',
    description: 'حققت أول فوز لك في لعبة X O',
    icon: '🏆',
    pointsBonus: 20,
    requirementType: 'wins',
    requirementValue: 1,
  },
  {
    id: 'five_wins',
    title: 'خبير التكتيك',
    description: 'حققت 5 انتصارات',
    icon: '⚡',
    pointsBonus: 50,
    requirementType: 'wins',
    requirementValue: 5,
  },
  {
    id: 'ai_crusher',
    title: 'قاهر الذكاء الاصطناعي',
    description: 'انتصرت على الكمبيوتر المستوى الخارق',
    icon: '🤖',
    pointsBonus: 100,
    requirementType: 'ai',
    requirementValue: 1,
  },
  {
    id: 'online_master',
    title: 'بطل الشبكة',
    description: 'حققت 3 انتصارات أونلاين ضد لاعبين حقيقيين',
    icon: '🌐',
    pointsBonus: 80,
    requirementType: 'online',
    requirementValue: 3,
  },
  {
    id: 'score_100',
    title: 'نادي المئة',
    description: 'وصل مجموع نقاطك إلى 100 نقطة',
    icon: '👑',
    pointsBonus: 50,
    requirementType: 'points',
    requirementValue: 100,
  },
  {
    id: 'friendly_rival',
    title: 'صديق المواجهات',
    description: 'لعبت مع أصدقائك في أونلاين',
    icon: '👥',
    pointsBonus: 40,
    requirementType: 'friends',
    requirementValue: 1,
  },
];

export function checkNewAchievements(profile: UserProfile, context?: { aiMastered?: boolean; onlineWins?: number }): string[] {
  const unlocked = new Set<string>(profile.achievements || []);
  const newUnlocked: string[] = [];

  ALL_ACHIEVEMENTS.forEach((ach) => {
    if (unlocked.has(ach.id)) return;

    let conditionMet = false;
    if (ach.requirementType === 'wins' && profile.wins >= ach.requirementValue) {
      conditionMet = true;
    } else if (ach.requirementType === 'points' && profile.points >= ach.requirementValue) {
      conditionMet = true;
    } else if (ach.requirementType === 'ai' && context?.aiMastered) {
      conditionMet = true;
    } else if (ach.requirementType === 'online' && (context?.onlineWins || 0) >= ach.requirementValue) {
      conditionMet = true;
    }

    if (conditionMet) {
      newUnlocked.push(ach.id);
    }
  });

  return newUnlocked;
}
