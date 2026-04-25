import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

interface PageRes<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export type FeedMediaType = 'image' | 'video' | 'gif';

export interface FeedMediaData {
  type: FeedMediaType;
  demoAssetId: string;
  aspectRatio: number;
  durationSec?: number;
  assetUris?: string[];
}

export interface FeedAuthorData {
  name: string;
  title: string;
}

export interface FeedItemData {
  id: number;
  user: FeedAuthorData;
  content: string;
  caption?: string;
  location?: string;
  media: FeedMediaData;
  coverAccent?: string;
  linkedPatternIdx?: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timeAgo: string;
  tags: string[];
}

export interface HotTopicItem {
  tag: string;
  count: string;
}

export interface StoryUserItem {
  name: string;
  hasNew: boolean;
  ring: [string, string];
}

export interface CommunityUserData {
  name: string;
  title: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  joinDate: string;
  tags: string[];
}

/* ────────── 真实 API ────────── */

export const feedApi = {
  /** 公开动态列表 */
  list: (tab: 'recommend' | 'latest' = 'recommend', page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<FeedItemData>>>('/feeds/list', { params: { tab, page, size } }),

  /** 关注的人的动态 */
  following: (page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<FeedItemData>>>('/feeds/following', { params: { page, size } }),

  /** 我发布的动态 */
  mine: (page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<FeedItemData>>>('/feeds/mine', { params: { page, size } }),

  /** 发布动态 */
  create: (data: { content: string; tags?: string; designId?: number }) =>
    client.post<any, ApiRes<any>>('/feeds', data),
};
