import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearFeedMockMediaCache, getFeedMockMediaCacheInfo } from './feedMedia';

const CACHE_META_KEY = '@beadforge/cache/meta';
const CACHE_PAYLOAD_KEYS = [
  '@beadforge/cache/image-previews',
  '@beadforge/cache/gif-thumbnails',
  '@beadforge/cache/browse-history',
];

type CacheBucketId = 'imagePreviews' | 'gifThumbnails' | 'browseHistory';

interface CacheMeta {
  buckets: Record<CacheBucketId, number>;
  lastClearedAt?: string;
}

export interface CacheItemSummary {
  id: string;
  title: string;
  description: string;
  bytes: number;
}

export interface CacheSummary {
  totalBytes: number;
  totalLabel: string;
  items: CacheItemSummary[];
  lastClearedAt?: string;
}

const DEFAULT_META: CacheMeta = {
  buckets: {
    imagePreviews: 73 * 1024 * 1024,
    gifThumbnails: 38 * 1024 * 1024,
    browseHistory: 17 * 1024 * 1024,
  },
};

export function formatCacheBytes(bytes: number) {
  if (bytes <= 0) {
    return '0 MB';
  }

  const mb = bytes / 1024 / 1024;
  if (mb >= 100) {
    return `${Math.round(mb)} MB`;
  }

  return `${Math.max(0.1, mb).toFixed(1)} MB`;
}

async function readCacheMeta(): Promise<CacheMeta> {
  const raw = await AsyncStorage.getItem(CACHE_META_KEY);
  if (!raw) {
    await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(DEFAULT_META));
    return DEFAULT_META;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CacheMeta>;
    return {
      buckets: {
        imagePreviews: parsed.buckets?.imagePreviews ?? DEFAULT_META.buckets.imagePreviews,
        gifThumbnails: parsed.buckets?.gifThumbnails ?? DEFAULT_META.buckets.gifThumbnails,
        browseHistory: parsed.buckets?.browseHistory ?? DEFAULT_META.buckets.browseHistory,
      },
      lastClearedAt: parsed.lastClearedAt,
    };
  } catch {
    await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(DEFAULT_META));
    return DEFAULT_META;
  }
}

function buildCacheSummary(meta: CacheMeta): CacheSummary {
  const mediaCache = getFeedMockMediaCacheInfo();
  const items: CacheItemSummary[] = [
    {
      id: 'imagePreviews',
      title: '图片预览缓存',
      description: '商城图片、动态图片预览的本地缓存记录',
      bytes: meta.buckets.imagePreviews,
    },
    {
      id: 'gifThumbnails',
      title: '动图缩略图缓存',
      description: '动态列表和详情页的 GIF / 视频封面缓存',
      bytes: meta.buckets.gifThumbnails,
    },
    {
      id: 'browseHistory',
      title: '本地浏览缓存',
      description: '最近浏览、临时预览和页面渲染缓存',
      bytes: meta.buckets.browseHistory,
    },
    {
      id: 'feedRuntime',
      title: '动态预览内存缓存',
      description: `${mediaCache.entries} 个动态预览已生成`,
      bytes: mediaCache.bytes,
    },
  ];
  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);

  return {
    totalBytes,
    totalLabel: formatCacheBytes(totalBytes),
    items,
    lastClearedAt: meta.lastClearedAt,
  };
}

export async function getAppCacheSummary() {
  const meta = await readCacheMeta();
  return buildCacheSummary(meta);
}

export async function clearAppCache() {
  clearFeedMockMediaCache();

  const nextMeta: CacheMeta = {
    buckets: {
      imagePreviews: 0,
      gifThumbnails: 0,
      browseHistory: 0,
    },
    lastClearedAt: new Date().toISOString(),
  };

  await AsyncStorage.multiRemove(CACHE_PAYLOAD_KEYS);
  await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(nextMeta));

  return buildCacheSummary(nextMeta);
}
