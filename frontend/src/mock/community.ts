import type { CommunityUserData, FeedItemData, StoryUserItem } from '../api/community';

const PATTERN_VARIANTS = 8;

export const ALL_FEEDS: FeedItemData[] = [
  {
    id: 1,
    user: { name: '木木手作', title: '创作者' },
    content: '今天把一组猫爪挂件重新拍了一遍，边缘压深后层次清楚很多。',
    caption: '暖灰背景比纯白底更适合这次的成品展示。',
    media: { type: 'image', demoAssetId: 'cat-charms-1', aspectRatio: 0.9 },
    coverAccent: '#FF9272',
    linkedPatternIdx: 1,
    likeCount: 128,
    commentCount: 23,
    shareCount: 5,
    timeAgo: '2 小时前',
    tags: ['挂件', '成品照'],
  },
  {
    id: 2,
    user: { name: '像素研究所', title: '像素创作' },
    content: '把 AI 起稿到手工修边的过程录成了短视频，回看时特别容易发现结构问题。',
    caption: '下一条准备补一个“修改前后对比版”。',
    media: { type: 'video', demoAssetId: 'process-video-1', aspectRatio: 0.8, durationSec: 14 },
    coverAccent: '#6E8CFF',
    linkedPatternIdx: 4,
    likeCount: 256,
    commentCount: 41,
    shareCount: 18,
    timeAgo: '3 小时前',
    tags: ['AI创作', '制作过程'],
  },
  {
    id: 3,
    user: { name: '清晨花园', title: '花草作者' },
    content: '这次把花束系列做成了礼物卡尺寸，送礼场景比挂画更实用。',
    caption: '花边位置比挂画版本更适合近距离观看。',
    media: { type: 'image', demoAssetId: 'flower-card-1', aspectRatio: 0.86 },
    coverAccent: '#F48CB7',
    linkedPatternIdx: 3,
    likeCount: 342,
    commentCount: 56,
    shareCount: 12,
    timeAgo: '5 小时前',
    tags: ['花草', '礼物'],
  },
  {
    id: 4,
    user: { name: '游戏存档', title: '复古像素' },
    content: '把复古蘑菇做成了循环小动画，摆在掌机旁边特别像游戏 UI。',
    caption: '这类内容用 GIF 比静态图更能看出层次。',
    media: { type: 'gif', demoAssetId: 'retro-gif-1', aspectRatio: 1 },
    coverAccent: '#57B8A5',
    linkedPatternIdx: 2,
    likeCount: 189,
    commentCount: 34,
    shareCount: 8,
    timeAgo: '8 小时前',
    tags: ['游戏', 'GIF'],
  },
  {
    id: 5,
    user: { name: '饰品工作室', title: '手作品牌' },
    content: '这批耳饰换成了更亮的布景，视频里珠子的光泽会明显很多。',
    caption: '成套展示比单独拍更容易出片。',
    media: { type: 'video', demoAssetId: 'earring-video-1', aspectRatio: 0.82, durationSec: 9 },
    coverAccent: '#FFB15A',
    linkedPatternIdx: 5,
    likeCount: 467,
    commentCount: 89,
    shareCount: 31,
    timeAgo: '昨天',
    tags: ['饰品', '短视频'],
  },
  {
    id: 6,
    user: { name: '宝石档案', title: '新手练习' },
    content: '蓝宝石系列先拍了一版静态图，想记录透明珠在不同光线下的变化。',
    caption: '这类题材真的很适合拍近景。',
    media: { type: 'image', demoAssetId: 'gem-photo-1', aspectRatio: 1.05 },
    coverAccent: '#5FA2FF',
    linkedPatternIdx: 6,
    likeCount: 95,
    commentCount: 12,
    shareCount: 3,
    timeAgo: '昨天',
    tags: ['宝石', '练习'],
  },
  {
    id: 7,
    user: { name: '拼豆小屋', title: '教程作者' },
    content: '彩虹挂画整理成了教程版，还顺手做了一张分步骤配色图。',
    caption: '之后会再补一版新手跟做说明。',
    media: { type: 'gif', demoAssetId: 'rainbow-gif-1', aspectRatio: 1.12 },
    coverAccent: '#8D71FF',
    linkedPatternIdx: 7,
    likeCount: 521,
    commentCount: 78,
    shareCount: 45,
    timeAgo: '2 天前',
    tags: ['教程', '彩虹'],
  },
];

export const HOT_TOPICS = [
  { tag: '春季手作', count: '1.2w' },
  { tag: 'AI 起稿', count: '8.6k' },
  { tag: '新手练习', count: '5.3k' },
  { tag: '迷你饰品', count: '3.8k' },
];

export const STORY_USERS: StoryUserItem[] = [
  { name: '木木手作', hasNew: true, ring: ['#FF6B6B', '#FF8E53'] },
  { name: '像素研究所', hasNew: true, ring: ['#5B5FFF', '#C084FC'] },
  { name: '饰品工作室', hasNew: true, ring: ['#F5A623', '#FF6B6B'] },
  { name: '拼豆小屋', hasNew: false, ring: ['#CCCCCC', '#DDDDDD'] },
  { name: '清晨花园', hasNew: false, ring: ['#CCCCCC', '#DDDDDD'] },
  { name: '游戏存档', hasNew: true, ring: ['#20C997', '#38D9A9'] },
  { name: '宝石档案', hasNew: false, ring: ['#CCCCCC', '#DDDDDD'] },
];

export const FOLLOWING_NAMES = new Set(['木木手作', '饰品工作室', '拼豆小屋']);
export const COMMUNITY_TABS = ['推荐', '关注', '最新'];

const COMMUNITY_USERS: Record<string, CommunityUserData> = {
  木木手作: { name: '木木手作', title: '创作者', bio: '主要做挂件和小尺寸卡片，最近在整理适合新手的动物系列模板。', followers: 1280, following: 156, posts: 45, likes: 3200, joinDate: '2023 年 7 月', tags: ['动物', '教程', '挂件'] },
  像素研究所: { name: '像素研究所', title: '像素创作', bio: '偏爱复古游戏和高对比像素图，常分享 AI 起稿后的二次编辑流程。', followers: 3560, following: 89, posts: 78, likes: 12000, joinDate: '2023 年 3 月', tags: ['AI创作', '像素', '流程'] },
  清晨花园: { name: '清晨花园', title: '花草作者', bio: '以花束和植物图案为主，喜欢做书签、贺卡和节日礼物场景。', followers: 892, following: 234, posts: 32, likes: 2100, joinDate: '2024 年 5 月', tags: ['花草', '礼物', '卡片'] },
  游戏存档: { name: '游戏存档', title: '复古像素', bio: '把经典游戏元素转成拼豆图纸，目标是做完一整套复古像素系列。', followers: 2100, following: 167, posts: 56, likes: 5800, joinDate: '2023 年 9 月', tags: ['游戏', '复古', '像素'] },
  饰品工作室: { name: '饰品工作室', title: '手作品牌', bio: '专注迷你珠饰品与耳饰搭配，常做定制场景的小尺寸设计。', followers: 5600, following: 78, posts: 120, likes: 23000, joinDate: '2022 年 11 月', tags: ['饰品', '耳饰', '定制'] },
  宝石档案: { name: '宝石档案', title: '新手练习', bio: '刚入门不久，主要练习宝石和抽象纹样，记录每次配色调整。', followers: 156, following: 312, posts: 8, likes: 420, joinDate: '2025 年 2 月', tags: ['宝石', '新手'] },
  拼豆小屋: { name: '拼豆小屋', title: '教程作者', bio: '整理常用配色、尺寸和材料建议，让第一次上手也能顺利做完作品。', followers: 12800, following: 45, posts: 256, likes: 89000, joinDate: '2021 年 8 月', tags: ['教程', '材料', '进阶'] },
};

export function getCommunityUserData(name: string): CommunityUserData {
  return COMMUNITY_USERS[name] || {
    name,
    title: '拼豆爱好者',
    bio: '这个用户还没有填写个人简介。',
    followers: 42,
    following: 88,
    posts: 5,
    likes: 120,
    joinDate: '2025 年 1 月',
    tags: [],
  };
}

const WORK_TITLES = ['猫爪挂件', '星空卡片', '花束书签', '复古蘑菇', '耳饰样片', '宝石练习', '彩虹挂画', '像素小屋'];

export function getCommunityUserWorks(name: string) {
  const user = getCommunityUserData(name);
  const seed = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const count = Math.min(user.posts, 6);
  return Array.from({ length: count }, (_, index) => ({
    patternIdx: (seed + index) % PATTERN_VARIANTS,
    likeCount: ((seed * (index + 1) * 7) % 500) + 10,
    commentCount: ((seed * (index + 1) * 3) % 80) + 2,
    title: WORK_TITLES[(seed + index) % WORK_TITLES.length],
  }));
}

export function getCommunityUserFeeds(name: string): FeedItemData[] {
  const user = getCommunityUserData(name);
  const seed = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const templates = [
    {
      content: '刚拍完一组新的成品照，准备挑几张做封面图。',
      caption: '暖色背景比白底更适合这次的配色。',
      mediaType: 'image' as const,
      aspectRatio: 0.92,
      durationSec: undefined,
      tags: user.tags.slice(0, 2),
    },
    {
      content: '把制作过程剪成了一条短视频，方便回看每一步的调整。',
      caption: '之后可能会把这个系列做成完整教程。',
      mediaType: 'video' as const,
      aspectRatio: 0.8,
      durationSec: 12,
      tags: user.tags.slice(0, 2),
    },
    {
      content: '这次尝试把展示内容做成循环动图，动态感会更强。',
      caption: '比静态图更适合展示小尺寸作品。',
      mediaType: 'gif' as const,
      aspectRatio: 1,
      durationSec: undefined,
      tags: user.tags.slice(0, 2),
    },
  ];

  return templates.slice(0, Math.min(3, user.posts)).map((template, index) => ({
    id: seed * 100 + index,
    user: { name: user.name, title: user.title },
    content: template.content,
    caption: template.caption,
    media: {
      type: template.mediaType,
      demoAssetId: `${user.name}-${template.mediaType}-${index}`,
      aspectRatio: template.aspectRatio,
      durationSec: template.durationSec,
    },
    coverAccent: ['#FF8DA8', '#6C8BFF', '#8E63FF'][index % 3],
    linkedPatternIdx: (seed + index) % PATTERN_VARIANTS,
    likeCount: ((seed * (index + 1) * 7) % 300) + 20,
    commentCount: ((seed * (index + 1) * 3) % 50) + 5,
    shareCount: ((seed * (index + 1) * 2) % 20) + 1,
    timeAgo: ['1 天前', '3 天前', '1 周前'][index] || '2 周前',
    tags: template.tags,
  }));
}

export const PROFILE_TABS = [
  { label: '作品', icon: 'view-grid-outline' as const, iconActive: 'view-grid' as const },
  { label: '动态', icon: 'text-box-outline' as const, iconActive: 'text-box' as const },
  { label: '喜欢', icon: 'heart-outline' as const, iconActive: 'heart' as const },
];
