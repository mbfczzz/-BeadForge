import { Feather } from '@expo/vector-icons';
import type { UserInfo } from '../api/auth';
import type { ProfileOrderFilterTab } from '../api/profile';
import type { UserStats } from '../api/user';

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

export const MINE_HEADER_ACTIONS: MineHeaderAction[] = [
  { id: 'notifications', label: '消息', icon: 'message-circle', actionKey: 'notifications' },
  { id: 'settings', label: '设置', icon: 'settings', actionKey: 'settings' },
];

export const MINE_TOOL_ITEMS: MineToolItem[] = [
  {
    id: 'designs',
    label: '我的作品',
    icon: 'grid',
    iconTint: '#2563EB',
    iconBackground: '#E0ECFF',
    actionKey: 'myDesigns',
  },
  {
    id: 'posts',
    label: '我的发布',
    icon: 'radio',
    iconTint: '#0F9E8A',
    iconBackground: '#DBF6F1',
    actionKey: 'myFeeds',
  },
  {
    id: 'likes',
    label: '我的点赞',
    icon: 'heart',
    iconTint: '#E5486D',
    iconBackground: '#FFE4EB',
    actionKey: 'likes',
  },
  {
    id: 'favorites',
    label: '我的收藏',
    icon: 'star',
    iconTint: '#F59E0B',
    iconBackground: '#FFF1CF',
    actionKey: 'favorites',
  },
  {
    id: 'history',
    label: '浏览记录',
    icon: 'clock',
    iconTint: '#6366F1',
    iconBackground: '#E6E8FF',
    actionKey: 'likedHistory',
  },
  {
    id: 'orders',
    label: '已购资源',
    icon: 'shopping-bag',
    iconTint: '#7C3AED',
    iconBackground: '#EFE3FF',
    actionKey: 'purchased',
  },
  {
    id: 'wallet',
    label: '积分钱包',
    icon: 'award',
    iconTint: '#0EA5E9',
    iconBackground: '#DFF5FF',
    actionKey: 'wallet',
  },
  {
    id: 'notices',
    label: '通知中心',
    icon: 'bell',
    iconTint: '#334155',
    iconBackground: '#E7EDF7',
    actionKey: 'notifications',
    badgeCount: 3,
  },
];

export const MINE_ORDER_SHORTCUTS: MineOrderShortcut[] = [
  {
    id: 'pending-payment',
    label: '待付款',
    icon: 'credit-card',
    pendingCount: 1,
    actionKey: 'orders',
    orderTab: '待支付' as ProfileOrderFilterTab,
  },
  {
    id: 'pending-shipping',
    label: '待发货',
    icon: 'package',
    pendingCount: 2,
    actionKey: 'orders',
    orderTab: '待发货' as ProfileOrderFilterTab,
  },
  {
    id: 'pending-receipt',
    label: '待收货',
    icon: 'truck',
    pendingCount: 1,
    actionKey: 'orders',
    orderTab: '待收货' as ProfileOrderFilterTab,
  },
  {
    id: 'completed',
    label: '已完成',
    icon: 'check-circle',
    pendingCount: 6,
    actionKey: 'orders',
  },
  {
    id: 'after-sale',
    label: '售后',
    icon: 'rotate-ccw',
    pendingCount: 0,
    actionKey: 'orders',
    orderTab: '退款/售后' as ProfileOrderFilterTab,
  },
];

export const MINE_MENU_ITEMS: MineMenuItem[] = [
  {
    id: 'addresses',
    label: '收货地址管理',
    description: '管理常用地址、默认收件人与联系电话',
    icon: 'map-pin',
    actionKey: 'addresses',
  },
  {
    id: 'tutorial',
    label: '使用教程',
    description: '查看新手指南、制作流程与功能操作说明',
    icon: 'book-open',
    actionKey: 'tutorial',
  },
  {
    id: 'feedback',
    label: '帮助与反馈',
    description: '提交问题、查看工单进度或联系支持团队',
    icon: 'help-circle',
    actionKey: 'feedback',
  },
];

function formatCount(value: number) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
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
    {
      id: 'followers',
      label: '粉丝',
      value: formatCount(stats.followerCount),
      actionKey: 'followers',
    },
    {
      id: 'following',
      label: '关注',
      value: formatCount(stats.followingCount),
      actionKey: 'following',
    },
    {
      id: 'likes',
      label: '获赞',
      value: formatCount(stats.likeCount),
      actionKey: 'likes',
    },
    {
      id: 'favorites',
      label: '收藏',
      value: formatCount(favoritesCount),
      actionKey: 'favorites',
    },
  ];
}
