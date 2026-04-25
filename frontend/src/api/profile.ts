import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

/* ────────── 类型契约（与 UI 形态对齐，保持原有定义） ────────── */

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

export interface ProfileAddressItem {
  id: string;
  receiver: string;
  phone: string;
  region: string;
  detail: string;
  tag?: string;
  isDefault?: boolean;
 }

export type ProfileOrderStatus =
  | '待支付'
  | '待发货'
  | '待收货'
  | '已完成'
  | '退款/售后';

export type ProfileOrderFilterTab =
  | '全部'
  | '待支付'
  | '待发货'
  | '待收货'
  | '退款/售后';

export interface ProfileOrderItem {
  id: string;
  title: string;
  amount: number;
  status: ProfileOrderStatus;
  createdAt: string;
  coverLabel?: string;
  category?: string;
  imageText?: string;
  itemCount?: number;
  receiver?: string;
  phone?: string;
  address?: string;
  trackingNo?: string;
  statusNote?: string;
}

export type ProfileNoticeType = '系统' | '订单' | '互动';

export type ProfileNoticeAction =
  | { type: 'orders'; tab?: ProfileOrderFilterTab }
  | { type: 'orderDetail'; orderId: string; tab?: ProfileOrderFilterTab }
  | { type: 'likes' }
  | { type: 'wallet' }
  | { type: 'settings' };

export interface ProfileNoticeItem {
  id: number;
  type: ProfileNoticeType;
  title: string;
  content: string;
  timeAgo: string;
  unread?: boolean;
  action?: ProfileNoticeAction;
}

/* ────────── 真实 API 调用 ────────── */

export const profileApi = {
  /** 我的收藏（默认 design 类型） */
  favorites: (type: 'design' | 'pattern' = 'design') =>
    client.get<any, ApiRes<ProfileFavoriteItem[]>>('/favorites', { params: { type } }),

  /** 我收到的赞 */
  receivedLikes: () =>
    client.get<any, ApiRes<ProfileReceivedLikeItem[]>>('/likes/received'),

  /** 我给出的赞 */
  givenLikes: () =>
    client.get<any, ApiRes<ProfileGivenLikeItem[]>>('/likes/given'),

  /** 我的粉丝 */
  followers: () =>
    client.get<any, ApiRes<ProfileFollowUser[]>>('/follow/followers'),

  /** 我关注的人 */
  following: () =>
    client.get<any, ApiRes<ProfileFollowUser[]>>('/follow/following'),
};
