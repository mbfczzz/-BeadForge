import type { DiscoverHomeConfig, HomeBannerItem } from '../api/discovery';

export const HOME_CATEGORIES = ['全部', '动物', '花草', '美食'];
export const HOME_CATEGORY_KEYS = ['', 'animal', 'flower', 'food'];

export const HOME_BANNERS: HomeBannerItem[] = [
  {
    id: 1,
    title: '热门精选',
    sub: '近期收藏和浏览都很高的图案',
    pi: 0,
    bg: '#4B78FF',
    cat: '',
    sort: 'hot',
    enabled: true,
    order: 1,
    eyebrow: '发现图纸',
    buttonText: '立即查看',
  },
  {
    id: 2,
    title: '动物主题',
    sub: '适合挂件和卡片的小尺寸作品',
    pi: 1,
    bg: '#D6B161',
    cat: '动物',
    sort: 'hot',
    enabled: true,
    order: 2,
    eyebrow: '发现图纸',
    buttonText: '热门动物',
  },
  {
    id: 3,
    title: '花草系列',
    sub: '贺卡和礼物封面常用花卉主题',
    pi: 3,
    bg: '#E986B5',
    cat: '花草',
    sort: 'latest',
    enabled: true,
    order: 3,
    eyebrow: '春季灵感',
    buttonText: '最新上架',
  },
  {
    id: 4,
    title: '美食图纸',
    sub: '杯垫、冰箱贴和摆台都很适合',
    pi: 5,
    bg: '#63A88B',
    cat: '美食',
    sort: 'hot',
    enabled: true,
    order: 4,
    eyebrow: '厨房灵感',
    buttonText: '看看新品',
  },
];

export const DISCOVER_HOME_CONFIG: DiscoverHomeConfig = {
  defaultTabKey: 'all',
  searchPlaceholder: '搜索图纸、作者或分类',
  resultTitle: '为你推荐',
  emptyText: '暂无匹配的图纸资源',
  tabs: [
    {
      key: 'all',
      label: '全部',
      bannerIds: [1, 2, 3, 4],
      sort: 'hot',
      enabled: true,
      order: 1,
      resultTitle: '为你推荐',
      emptyText: '暂无推荐图纸',
    },
    {
      key: 'animal',
      label: '动物',
      categories: ['动物'],
      bannerIds: [2],
      sort: 'hot',
      enabled: true,
      order: 2,
      resultTitle: '动物推荐',
      emptyText: '暂无动物主题图纸',
    },
    {
      key: 'flower',
      label: '花草',
      categories: ['花草'],
      bannerIds: [3],
      sort: 'latest',
      enabled: true,
      order: 3,
      resultTitle: '花草推荐',
      emptyText: '暂无花草主题图纸',
    },
    {
      key: 'food',
      label: '美食',
      categories: ['美食'],
      bannerIds: [4],
      sort: 'hot',
      enabled: true,
      order: 4,
      resultTitle: '美食推荐',
      emptyText: '暂无美食主题图纸',
    },
  ],
};

export const DEFAULT_HOME_BANNERS = HOME_BANNERS
  .filter((item) => item.enabled !== false)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export function getDefaultHomeBanners() {
  return DEFAULT_HOME_BANNERS.map((item) => ({ ...item }));
}

export function getDiscoverHomeConfig() {
  return {
    ...DISCOVER_HOME_CONFIG,
    tabs: [...DISCOVER_HOME_CONFIG.tabs]
      .filter((item) => item.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => ({ ...item })),
  };
}
