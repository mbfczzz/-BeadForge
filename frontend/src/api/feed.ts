import client from './client';
import type { PageData } from './design';
import type { FeedItemData } from '../navigation/types';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

/** 后端 /feeds/list 返回的单项（FeedController.enrichFeeds 构造的 Map） */
export interface FeedDTO {
  id: number;
  user?: { name?: string; title?: string };
  content: string;
  designId?: number;
  tags?: string[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  timeAgo?: string;
  createdAt?: string;
}

export const feedApi = {
  /** 公共动态列表：tab=recommend（默认，按点赞降序） / latest（按时间） */
  list: (params: { page?: number; size?: number; tab?: 'recommend' | 'latest' } = {}) =>
    client.get<any, ApiRes<PageData<FeedDTO>>>('/feeds/list', {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        tab: params.tab ?? 'recommend',
      },
    }),

  /** 关注的人的动态（需登录） */
  following: (params: { page?: number; size?: number } = {}) =>
    client.get<any, ApiRes<PageData<FeedDTO>>>('/feeds/following', {
      params: { page: params.page ?? 1, size: params.size ?? 20 },
    }),

  create: (payload: { content: string; designId?: number; tags?: string }) =>
    client.post<any, ApiRes<FeedDTO>>('/feeds', payload),
};

// patternIdx 稳定映射到 ALL_PATTERNS；大致足够视觉区分，不依赖后端
const PAT_COUNT_GUESS = 16;

export function toFeedItem(dto: FeedDTO): FeedItemData {
  const base = dto.designId ?? dto.id ?? 0;
  return {
    id: dto.id,
    user: { name: dto.user?.name || '匿名', title: dto.user?.title || '创作者' },
    content: dto.content || '',
    patternIdx: Math.abs(base) % Math.max(1, PAT_COUNT_GUESS),
    likeCount: dto.likeCount || 0,
    commentCount: dto.commentCount || 0,
    shareCount: dto.shareCount || 0,
    timeAgo: dto.timeAgo || '',
    tags: dto.tags || [],
  };
}
