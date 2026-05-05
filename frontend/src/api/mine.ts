import { Feather } from '@expo/vector-icons';
import type { UserInfo } from './auth';
import type { ProfileOrderFilterTab } from './profile';
import type { UserStats } from './user';

export type MineActionKey =
  | 'editProfile'
  | 'followers'
  | 'following'
  | 'likes'
  | 'favorites'
  | 'myDesigns'
  | 'myFeeds'
  | 'likedHistory'
  | 'purchased'
  | 'wallet'
  | 'notifications'
  | 'settings'
  | 'addresses'
  | 'feedback'
  | 'orders'
  | 'tutorial';

export interface MineHeaderAction {
  id: 'notifications' | 'settings';
  label: string;
  icon: keyof typeof Feather.glyphMap;
  actionKey: MineActionKey;
}

export interface MineStatItem {
  id: string;
  label: string;
  value: string;
  actionKey: MineActionKey;
}

export interface MineToolItem {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  iconTint: string;
  iconBackground: string;
  actionKey: MineActionKey;
  badgeCount?: number;
}

export interface MineOrderShortcut {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  pendingCount: number;
  actionKey: 'orders';
  orderTab?: ProfileOrderFilterTab;
}

export interface MineMenuItem {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  actionKey: MineActionKey;
}

export interface MineProfileSummary {
  displayName: string;
  avatarText: string;
  signature: string;
  levelLabel: string;
  levelHint: string;
  pointsLabel: string;
  pointsValue: string;
  checkInHint: string;
}

export const MINE_PAGE_TITLE = '我的';

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

export function buildMineProfileSummary(
  user: UserInfo | null,
  stats: UserStats,
  pointsBalance: number,
): MineProfileSummary {
  const displayName = user?.nickname?.trim() || user?.username?.trim() || 'BeadMori';
  const avatarText = displayName.slice(0, 1).toUpperCase();
  const signature = user?.bio?.trim() || '记录手作灵感、拼豆配色和每一次认真完成的小作品。';
  const currentLevel = Math.max(3, stats.designCount + 2);

  return {
    displayName,
    avatarText,
    signature,
    levelLabel: `Lv.${currentLevel} 创作者`,
    levelHint: `本周已累计 ${stats.designCount} 个作品灵感`,
    pointsLabel: '我的积分',
    pointsValue: formatCount(pointsBalance),
    checkInHint: '今日签到可领取 20 积分',
  };
}

export function buildMineStatItems(
  stats: UserStats,
  favoritesCount: number,
): MineStatItem[] {
  return [
    { id: 'followers', label: '粉丝', value: formatCount(stats.followerCount), actionKey: 'followers' },
    { id: 'following', label: '关注', value: formatCount(stats.followingCount), actionKey: 'following' },
    { id: 'likes',     label: '获赞', value: formatCount(stats.likeCount),     actionKey: 'likes' },
    { id: 'favorites', label: '收藏', value: formatCount(favoritesCount),     actionKey: 'favorites' },
  ];
}
