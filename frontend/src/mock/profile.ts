import type { UserStats } from '../api/user';

export interface ProfileFavoriteItem {
  id: number;
  title: string;
  author: string;
  patternIndex: number;
  likeCount: number;
}

export interface ProfileReceivedLikeItem {
  id: number;
  userName: string;
  username: string;
  userTitle: string;
  targetTitle: string;
  targetType: '作品' | '动态';
  timeAgo: string;
}

export interface ProfileGivenLikeItem {
  id: number;
  title: string;
  author: string;
  patternIndex: number;
  likeCount: number;
  targetType: '作品' | '动态';
  timeAgo: string;
}

export interface ProfileFollowUser {
  id: number;
  username: string;
  nickname: string;
  bio: string;
  followed?: boolean;
}

export interface ProfileWalletLog {
  id: number;
  title: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface ProfileOrderItem {
  id: string;
  title: string;
  amount: number;
  status: '待发货' | '已完成' | '退款中';
  createdAt: string;
}

export interface ProfileFeedItem {
  id: number;
  content: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timeAgo: string;
  patternIndex: number;
}

export const MOCK_PROFILE_FAVORITES: ProfileFavoriteItem[] = [
  { id: 1, title: '像素爱心', author: '木木手作', patternIndex: 0, likeCount: 328 },
  { id: 2, title: '橘猫头像', author: '拼豆达人', patternIndex: 1, likeCount: 512 },
  { id: 3, title: '复古蘑菇', author: '游戏存档', patternIndex: 2, likeCount: 445 },
  { id: 4, title: '粉色小花', author: '清晨花园', patternIndex: 3, likeCount: 267 },
  { id: 5, title: '夜空星点', author: '像素研究所', patternIndex: 4, likeCount: 189 },
  { id: 6, title: '双色挂件', author: '饰品工作室', patternIndex: 5, likeCount: 376 },
];

export const MOCK_PROFILE_RECEIVED_LIKES: ProfileReceivedLikeItem[] = [
  { id: 11, userName: '木木手作', username: 'mumu_handmade', userTitle: '创作者', targetTitle: '像素花束卡片', targetType: '作品', timeAgo: '12 分钟前' },
  { id: 12, userName: '像素研究所', username: 'pixel_room', userTitle: '像素创作', targetTitle: '奶茶杯垫', targetType: '作品', timeAgo: '38 分钟前' },
  { id: 13, userName: '清晨花园', username: 'flower_garden', userTitle: '花卉作者', targetTitle: '云朵钥匙扣', targetType: '作品', timeAgo: '2 小时前' },
  { id: 14, userName: '拼豆小屋', username: 'bead_store', userTitle: '教程作者', targetTitle: '今天补完了一组猫咪挂件', targetType: '动态', timeAgo: '昨天' },
  { id: 15, userName: '宝石档案', username: 'gem_notes', userTitle: '新手练习', targetTitle: '草莓贴片', targetType: '作品', timeAgo: '2 天前' },
  { id: 16, userName: '彩虹架', username: 'rainbow_lab', userTitle: '配色研究', targetTitle: '把花束系列整理成卡片尺寸', targetType: '动态', timeAgo: '3 天前' },
];

export const MOCK_PROFILE_GIVEN_LIKES: ProfileGivenLikeItem[] = [
  { id: 31, title: '橘猫头像', author: '木木手作', patternIndex: 1, likeCount: 512, targetType: '作品', timeAgo: '18 分钟前' },
  { id: 32, title: '复古蘑菇', author: '像素研究所', patternIndex: 2, likeCount: 445, targetType: '作品', timeAgo: '1 小时前' },
  { id: 33, title: '郁金香书签', author: '清晨花园', patternIndex: 3, likeCount: 267, targetType: '作品', timeAgo: '昨天' },
  { id: 34, title: '今天补完了一组猫咪挂件', author: '拼豆小屋', patternIndex: 7, likeCount: 128, targetType: '动态', timeAgo: '昨天' },
  { id: 35, title: '山谷日出', author: '小景观工作室', patternIndex: 4, likeCount: 288, targetType: '作品', timeAgo: '2 天前' },
  { id: 36, title: '把花束系列整理成卡片尺寸', author: '彩虹架', patternIndex: 6, likeCount: 356, targetType: '动态', timeAgo: '3 天前' },
];

export const MOCK_PROFILE_FOLLOWERS: ProfileFollowUser[] = [
  { id: 21, username: 'bead_master', nickname: '拼豆达人', bio: '偏爱像素风和小尺寸挂件。' },
  { id: 22, username: 'flower_garden', nickname: '清晨花园', bio: '花束、贺卡和礼物主题设计。' },
  { id: 23, username: 'rainbow_lab', nickname: '彩虹架', bio: '专注配色和渐变图案。' },
];

export const MOCK_PROFILE_FOLLOWING: ProfileFollowUser[] = [
  { id: 31, username: 'mumu_handmade', nickname: '木木手作', bio: '擅长入门作品和教程拆解。', followed: true },
  { id: 32, username: 'pixel_room', nickname: '像素研究所', bio: '复古像素图案和 AI 起稿流程。', followed: true },
  { id: 33, username: 'bead_store', nickname: '拼豆小屋', bio: '整理常用材料和尺寸建议。', followed: true },
];

export const MOCK_PROFILE_WALLET = {
  balance: 860,
  totalCharged: 1200,
  totalSpent: 340,
};

export const MOCK_PROFILE_WALLET_LOGS: ProfileWalletLog[] = [
  {
    id: 41,
    title: '购买图纸',
    description: '复古蘑菇图纸',
    amount: -19,
    createdAt: '2026-04-16 09:24',
  },
  {
    id: 42,
    title: '账户充值',
    description: '本地演示账户充值',
    amount: 300,
    createdAt: '2026-04-15 21:10',
  },
  {
    id: 43,
    title: '购买图纸',
    description: '夜空星点图纸',
    amount: -21,
    createdAt: '2026-04-14 18:06',
  },
];

export const MOCK_PROFILE_ORDERS: ProfileOrderItem[] = [
  { id: 'BF240416001', title: '5mm 标准珠 48 色', amount: 29.9, status: '待发货', createdAt: '2026-04-16' },
  { id: 'BF240414008', title: '新手入门套装', amount: 39.9, status: '已完成', createdAt: '2026-04-14' },
  { id: 'BF240410015', title: '透明拼豆板 29x29', amount: 8.9, status: '退款中', createdAt: '2026-04-10' },
];

export function buildMockMyFeeds(displayName: string): ProfileFeedItem[] {
  return [
    {
      id: 51,
      content: `${displayName} 今天把花束系列重新整理了一版，颜色层次比上一稿更清楚了。`,
      tags: ['花束', '配色'],
      likeCount: 36,
      commentCount: 8,
      shareCount: 2,
      timeAgo: '刚刚',
      patternIndex: 3,
    },
    {
      id: 52,
      content: '把一张照片转成拼豆草稿后又手动修了边缘，小尺寸成品会稳定很多。',
      tags: ['图片转换', '草稿'],
      likeCount: 52,
      commentCount: 14,
      shareCount: 5,
      timeAgo: '昨天',
      patternIndex: 4,
    },
    {
      id: 53,
      content: '这次尝试把挂件做成成套主题，后面准备补一份配色说明。',
      tags: ['挂件', '教程'],
      likeCount: 28,
      commentCount: 6,
      shareCount: 1,
      timeAgo: '3 天前',
      patternIndex: 1,
    },
  ];
}

export function getProfilePoints(stats: UserStats) {
  return stats.designCount * 20 + stats.likeCount * 2 + stats.followerCount * 3;
}
