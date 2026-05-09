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
  /** 后端在 mediaUrls 为空且关联 designId 时附带的 grid，前端用 BeadGrid 渲染兜底 */
  beadGrid?: string[][];
}

export interface FeedAuthorData {
  id?: number;
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
  liked?: boolean;
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
  id: number | null;
  name: string;
  title: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  joinDate: string;
  tags: string[];
  gender?: string | null;
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

  /** 公开 — 某用户发布的动态 */
  byUser: (userId: number, page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<FeedItemData>>>(`/feeds/by-user/${userId}`, { params: { page, size } }),

  /** 发布动态 */
  create: (data: { content: string; tags?: string; designId?: number; mediaUrls?: string; mediaType?: 'image' | 'gif' | 'video' }) =>
    client.post<any, ApiRes<any>>('/feeds', data),
};

export interface PublicDesignItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  coverImage?: string;
  authorName?: string;
  /** 后端返的是 JSON 字符串（cols×rows hex 数组），前端 parse 后画缩略图 */
  designData?: string | string[][] | null;
  likeCount: number;
  viewCount: number;
  status: string;
}

export const designApi = {
  byUser: (userId: number, page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<PublicDesignItem>>>(`/designs/public/by-user/${userId}`, { params: { page, size } }),
};

export interface UserLikedItem {
  id: number;
  targetType: '动态' | '作品';
  targetId: number;
  title: string;
  author: string;
  patternIndex: number;
  likeCount: number;
  timeAgo: string;
}

export type LikeTarget = 'design' | 'feed' | 'pattern' | 'comment';
export type FavoriteTarget = 'design' | 'pattern';

export const likeApi = {
  like: (type: LikeTarget, id: number) =>
    client.post<any, ApiRes<null>>(`/likes/${type}/${id}`),
  unlike: (type: LikeTarget, id: number) =>
    client.delete<any, ApiRes<null>>(`/likes/${type}/${id}`),
  check: (type: LikeTarget, id: number) =>
    client.get<any, ApiRes<{ liked: boolean }>>(`/likes/check/${type}/${id}`),
  byUser: (userId: number) =>
    client.get<any, ApiRes<UserLikedItem[]>>(`/likes/by-user/${userId}`),
};

export const favoriteApi = {
  add: (type: FavoriteTarget, id: number) =>
    client.post<any, ApiRes<null>>(`/favorites/${type}/${id}`),
  remove: (type: FavoriteTarget, id: number) =>
    client.delete<any, ApiRes<null>>(`/favorites/${type}/${id}`),
  check: (type: FavoriteTarget, id: number) =>
    client.get<any, ApiRes<{ favorited: boolean }>>(`/favorites/check/${type}/${id}`),
};

export const followApi = {
  follow: (targetUserId: number) =>
    client.post<any, ApiRes<null>>(`/follow/${targetUserId}`),
  unfollow: (targetUserId: number) =>
    client.delete<any, ApiRes<null>>(`/follow/${targetUserId}`),
  check: (targetUserId: number) =>
    client.get<any, ApiRes<boolean>>(`/follow/check/${targetUserId}`),
};

export type CommentTarget = 'feed' | 'design';

export interface CommentItem {
  id: number;
  content: string;
  parentId: number | null;
  replyToUserName: string | null;
  timeAgo: string;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  user: {
    id: number;
    name: string;
    title: string;
  };
}

export interface MyCommentItem {
  id: string;
  content: string;
  target: string;
  targetType: 'FEED' | 'DESIGN';
  targetId: number;
  user: '我';
  time: string;
}

export const commentApi = {
  list: (type: CommentTarget, id: number) =>
    client.get<any, ApiRes<CommentItem[]>>('/comments', { params: { type, id } }),
  create: (type: CommentTarget, id: number, content: string, parentId?: number) =>
    client.post<any, ApiRes<CommentItem>>('/comments', { content, parentId }, { params: { type, id } }),
  remove: (id: number) =>
    client.delete<any, ApiRes<null>>(`/comments/${id}`),
  /** 我发出的评论（通知页 "我评论的" tab） */
  mine: () =>
    client.get<any, ApiRes<MyCommentItem[]>>('/comments/mine'),
};
