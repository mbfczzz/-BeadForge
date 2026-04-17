import type { DesignItem } from '../api/design';
import type { EditorMode, FeedItemData } from '../navigation/types';

const PATTERN_VARIANTS = 8;

export const HOME_CATEGORIES = ['全部', '动物', '卡通', '花卉', '美食', '风景', '抽象', '像素', '节日', '手办', '建筑', '游戏', '国风'];
export const HOME_CATEGORY_KEYS = ['', 'animal', 'character', 'flower', 'food', 'scenery', 'abstract', 'pixel', 'festival', 'figure', 'building', 'game', 'chinese'];
export const HOME_SORT_OPTIONS = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热度' },
  { key: 'popular', label: '点赞' },
  { key: 'views', label: '浏览' },
];
export const HOME_BANNERS = [
  { id: 1, title: '热门精选', sub: '近期收藏与浏览最高的图案', pi: 0, bg: '#4B78FF', sort: 'hot', cat: '' },
  { id: 2, title: '动物主题', sub: '适合挂件和卡片的小尺寸作品', pi: 1, bg: '#D6B161', sort: 'popular', cat: 'animal' },
  { id: 3, title: '像素经典', sub: '复古游戏和像素角色灵感合集', pi: 2, bg: '#549DA5', sort: 'popular', cat: 'pixel' },
  { id: 4, title: '花束系列', sub: '用于节日与礼物场景的花卉图纸', pi: 3, bg: '#BF60FE', sort: 'latest', cat: 'flower' },
];

export const MOCK_DESIGNS: DesignItem[] = [
  { id: 101, userId: 1001, authorName: '测试用户', title: '奶茶杯垫', description: '16x16 拼豆杯垫，适合新手练习配色', category: '美食', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 26, viewCount: 188, createdAt: '2026-04-15' },
  { id: 102, userId: 1001, authorName: '测试用户', title: '像素花束卡片', description: '节日贺卡封面图案', category: '花卉', coverImage: null, designData: null, status: 'DRAFT', likeCount: 14, viewCount: 96, createdAt: '2026-04-14' },
  { id: 103, userId: 1001, authorName: '测试用户', title: '云朵钥匙扣', description: '适合做挂件的轻量图案', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 31, viewCount: 214, createdAt: '2026-04-13' },
  { id: 104, userId: 1001, authorName: '测试用户', title: '草莓贴片', description: '迷你珠规格效果更好', category: '美食', coverImage: null, designData: null, status: 'ARCHIVED', likeCount: 8, viewCount: 62, createdAt: '2026-04-12' },
  { id: 105, userId: 2, authorName: '木木手作', title: '橘猫头像', description: '适合做冰箱贴和书签装饰', category: '动物', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 98, viewCount: 521, createdAt: '2026-04-16' },
  { id: 106, userId: 3, authorName: '像素研究所', title: '复古蘑菇', description: '经典像素风图案，可做挂件', category: '像素', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 86, viewCount: 470, createdAt: '2026-04-15' },
  { id: 107, userId: 4, authorName: '清晨花园', title: '郁金香书签', description: '竖版书签图案，适合礼物', category: '花卉', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 73, viewCount: 332, createdAt: '2026-04-14' },
  { id: 108, userId: 5, authorName: '小景观工作室', title: '山谷日出', description: '风景向拼豆挂画小样', category: '风景', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 54, viewCount: 288, createdAt: '2026-04-10' },
  { id: 109, userId: 6, authorName: '国风像素社', title: '祥云纹样', description: '适合胸针和装饰牌', category: '国风', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 61, viewCount: 301, createdAt: '2026-04-09' },
  { id: 110, userId: 7, authorName: '节日工坊', title: '节庆灯笼', description: '节日主题小尺寸作品', category: '节日', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 45, viewCount: 240, createdAt: '2026-04-08' },
  { id: 111, userId: 8, authorName: '玩具盒子', title: '机器人手办', description: '手办底座装饰图案', category: '手办', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 67, viewCount: 356, createdAt: '2026-04-07' },
  { id: 112, userId: 9, authorName: '建筑线稿', title: '拱门街景', description: '建筑主题拼豆卡片', category: '建筑', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 38, viewCount: 204, createdAt: '2026-04-06' },
];

export function getMockPublicDesignPage(params: {
  page: number;
  size: number;
  sortBy: string;
  category?: string | null;
  keyword?: string;
}) {
  const { page, size, sortBy, category, keyword } = params;
  let list = [...MOCK_DESIGNS];

  if (category) {
    const categoryIndex = HOME_CATEGORY_KEYS.indexOf(category);
    const label = categoryIndex >= 0 ? HOME_CATEGORIES[categoryIndex] : category;
    list = list.filter((item) => item.category === label || item.category === category);
  }

  if (keyword?.trim()) {
    const q = keyword.trim().toLowerCase();
    list = list.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.authorName?.toLowerCase().includes(q),
    );
  }

  if (sortBy === 'popular' || sortBy === 'hot') {
    list.sort((a, b) => b.likeCount - a.likeCount);
  } else if (sortBy === 'views') {
    list.sort((a, b) => b.viewCount - a.viewCount);
  } else {
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const start = (page - 1) * size;
  const records = list.slice(start, start + size);
  return { records, total: list.length, current: page, size };
}

export function getMockMyDesignPage(params: { page: number; size: number; userId?: number | null }) {
  const { page, size, userId } = params;
  const mine = MOCK_DESIGNS
    .filter((item) => !userId || item.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const start = (page - 1) * size;
  const records = mine.slice(start, start + size);
  return { records, total: mine.length, current: page, size };
}

export const CREATE_SIZES = [
  { label: '小', cols: 9, rows: 9, desc: '钥匙扣', icon: 'key' as const },
  { label: '中', cols: 16, rows: 16, desc: '杯垫', icon: 'coffee' as const },
  { label: '大', cols: 24, rows: 24, desc: '挂画', icon: 'image' as const },
  { label: '宽幅', cols: 32, rows: 16, desc: '书签', icon: 'bookmark' as const },
];

export const CREATE_METHODS: { key: EditorMode; icon: string; title: string; desc: string; color: string }[] = [
  { key: 'manual', icon: 'edit-2', title: '手动创作', desc: '逐颗放置珠子并手动调整结构', color: '#4B78FF' },
  { key: 'image', icon: 'image', title: '图片转换', desc: '从照片生成基础拼豆图纸', color: '#F97316' },
  { key: 'ai', icon: 'cpu', title: 'AI 生成', desc: '根据描述生成可继续编辑的草稿', color: '#8B5CF6' },
];

export const CREATE_TIPS = [
  { icon: 'grid', title: '从规则图形开始', desc: '圆形、爱心和字母更容易控制结构', bg: '#EEF2FF', mode: 'manual' as EditorMode },
  { icon: 'camera', title: '先做高对比图片', desc: '主体清晰的照片转换成功率更高', bg: '#FEF3C7', mode: 'image' as EditorMode },
  { icon: 'cpu', title: '先写清材质和尺寸', desc: '描述里带尺寸和用途更容易得到可用草稿', bg: '#F3E8FF', mode: 'ai' as EditorMode },
];

export const ALL_FEEDS: FeedItemData[] = [
  { id: 1, user: { name: '木木手作', title: '创作者' }, content: '今天补完了一组猫咪挂件，把边缘颜色重新压暗后层次清楚很多。', patternIdx: 1, likeCount: 128, commentCount: 23, shareCount: 5, timeAgo: '2小时前', tags: ['挂件', '新手'] },
  { id: 2, user: { name: '像素研究所', title: '像素创作' }, content: '用 AI 起稿后再手工修边，效率比完全从零画高很多。', patternIdx: 4, likeCount: 256, commentCount: 41, shareCount: 18, timeAgo: '3小时前', tags: ['AI创作', '像素'] },
  { id: 3, user: { name: '清晨花园', title: '花卉作者' }, content: '这次把花束系列做成卡片尺寸，送礼场景比挂画更实用。', patternIdx: 3, likeCount: 342, commentCount: 56, shareCount: 12, timeAgo: '5小时前', tags: ['花卉', '礼物'] },
  { id: 4, user: { name: '游戏存档', title: '复古像素' }, content: '复古蘑菇版本更新了，换成两种红色后主体更立体。', patternIdx: 2, likeCount: 189, commentCount: 34, shareCount: 8, timeAgo: '8小时前', tags: ['游戏', '像素'] },
  { id: 5, user: { name: '饰品工作室', title: '手作品牌' }, content: '这批耳饰用了 2.6mm 迷你珠，配件装上后效果稳定很多。', patternIdx: 5, likeCount: 467, commentCount: 89, shareCount: 31, timeAgo: '昨天', tags: ['饰品', '耳饰'] },
  { id: 6, user: { name: '宝石档案', title: '新手练习' }, content: '蓝宝石系列先完成第一版，下一步准备试试透明珠的搭配。', patternIdx: 6, likeCount: 95, commentCount: 12, shareCount: 3, timeAgo: '昨天', tags: ['宝石', '练习'] },
  { id: 7, user: { name: '拼豆小屋', title: '教程作者' }, content: '彩虹挂画整理成了教程版，新手可以按颜色分区逐步完成。', patternIdx: 7, likeCount: 521, commentCount: 78, shareCount: 45, timeAgo: '2天前', tags: ['教程', '彩虹'] },
];

export const HOT_TOPICS = [
  { tag: '春季手作', count: '1.2w' },
  { tag: 'AI 起稿', count: '8.6k' },
  { tag: '新手练习', count: '5.3k' },
  { tag: '迷你饰品', count: '3.8k' },
];

export const STORY_USERS = [
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

const COMMUNITY_USERS: Record<string, CommunityUserData> = {
  木木手作: { name: '木木手作', title: '创作者', bio: '主要做挂件和小尺寸卡片，最近在整理适合新手的动物系列模板。', followers: 1280, following: 156, posts: 45, likes: 3200, joinDate: '2023年6月', tags: ['动物', '教程', '挂件'] },
  像素研究所: { name: '像素研究所', title: '像素创作', bio: '偏爱复古游戏和高对比像素图，常分享 AI 起稿后的二次编辑流程。', followers: 3560, following: 89, posts: 78, likes: 12000, joinDate: '2023年3月', tags: ['AI创作', '像素', '流程'] },
  清晨花园: { name: '清晨花园', title: '花卉作者', bio: '花束和植物图案为主，喜欢做书签、贺卡和节日礼物场景。', followers: 892, following: 234, posts: 32, likes: 2100, joinDate: '2024年1月', tags: ['花卉', '礼物', '卡片'] },
  游戏存档: { name: '游戏存档', title: '复古像素', bio: '把经典游戏元素转成拼豆图纸，目标是做完一整套复古像素系列。', followers: 2100, following: 167, posts: 56, likes: 5800, joinDate: '2023年8月', tags: ['游戏', '复古', '像素'] },
  饰品工作室: { name: '饰品工作室', title: '手作品牌', bio: '专注迷你珠饰品与耳饰搭配，常做定制场景的小尺寸设计。', followers: 5600, following: 78, posts: 120, likes: 23000, joinDate: '2022年11月', tags: ['饰品', '耳饰', '定制'] },
  宝石档案: { name: '宝石档案', title: '新手练习', bio: '刚入门不久，主要练习宝石和抽象纹样，记录每次配色调整。', followers: 156, following: 312, posts: 8, likes: 420, joinDate: '2025年2月', tags: ['宝石', '新手'] },
  拼豆小屋: { name: '拼豆小屋', title: '教程作者', bio: '整理常用配色、尺寸和材料建议，让第一次上手也能顺利做完作品。', followers: 12800, following: 45, posts: 256, likes: 89000, joinDate: '2021年5月', tags: ['教程', '材料', '进阶'] },
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
    joinDate: '2025年1月',
    tags: [],
  };
}

const WORK_TITLES = ['猫咪挂件', '星空卡片', '花束书签', '复古蘑菇', '耳饰样片', '宝石练习', '彩虹挂画', '像素小屋'];

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
  const contents = [
    '刚完成一版新作品，正在继续微调边缘和配色。',
    '今天把配色方案重新整理了一遍，明度层次更稳定了。',
    '高难度图案终于做完，后面准备补一份步骤说明。',
    '记录一个小技巧：熨烫前先检查透明珠和深色珠的边缘位置。',
  ];

  return contents.slice(0, Math.min(3, user.posts)).map((content, index) => ({
    id: seed * 100 + index,
    user: { name: user.name, title: user.title },
    content,
    patternIdx: (seed + index) % PATTERN_VARIANTS,
    likeCount: ((seed * (index + 1) * 7) % 300) + 20,
    commentCount: ((seed * (index + 1) * 3) % 50) + 5,
    shareCount: ((seed * (index + 1) * 2) % 20) + 1,
    timeAgo: ['1天前', '3天前', '1周前'][index] || '2周前',
    tags: user.tags.slice(0, 2),
  }));
}

export const PROFILE_TABS = [
  { label: '作品', icon: 'view-grid-outline' as const, iconActive: 'view-grid' as const },
  { label: '动态', icon: 'text-box-outline' as const, iconActive: 'text-box' as const },
  { label: '喜欢', icon: 'heart-outline' as const, iconActive: 'heart' as const },
];

export interface MockMaterialProduct {
  id: number;
  name: string;
  desc: string;
  price: number;
  originalPrice?: number;
  sales: number;
  rating: number;
  tag?: string;
  color: string;
  icon: string;
  cat: string;
  specs: string[];
}

export const MARKET_MATERIAL_CATEGORIES = ['全部', '珠子', '拼豆板', '工具', '套装', '配件'];
export const MARKET_MATERIAL_SORTS = ['综合', '销量', '价格从低到高', '价格从高到低'];
export const MOCK_PRODUCTS: MockMaterialProduct[] = [
  { id: 1, name: '5mm 标准珠 48 色', desc: '适合入门练习和常规挂件制作', price: 29.9, originalPrice: 49.9, sales: 8234, rating: 4.8, tag: '热卖', color: '#EF4444', icon: 'box', cat: '珠子', specs: ['5mm', '48色', '约4000颗'] },
  { id: 2, name: '2.6mm 迷你珠 72 色', desc: '适合精细图案和饰品打样', price: 45.0, sales: 3421, rating: 4.9, color: '#8B5CF6', icon: 'box', cat: '珠子', specs: ['2.6mm', '72色', '约6000颗'] },
  { id: 3, name: '大号拼豆板 29x29', desc: '透明材质，可拼接扩展', price: 8.9, originalPrice: 12.0, sales: 12500, rating: 4.7, tag: '常备', color: '#3B82F6', icon: 'layout', cat: '拼豆板', specs: ['29x29', '透明'] },
  { id: 4, name: '六角拼豆板', desc: '适合徽章和装饰牌结构', price: 6.5, sales: 5600, rating: 4.6, color: '#22C55E', icon: 'hexagon', cat: '拼豆板', specs: ['六角形', '透明'] },
  { id: 5, name: '尖头镊子', desc: '适合精确摆放迷你珠', price: 5.9, sales: 9870, rating: 4.8, color: '#F97316', icon: 'tool', cat: '工具', specs: ['不锈钢', '尖头'] },
  { id: 6, name: '熨烫纸 50 张', desc: '耐高温，不易粘珠', price: 3.5, originalPrice: 5.0, sales: 15600, rating: 4.5, tag: '常用', color: '#EC4899', icon: 'file', cat: '配件', specs: ['50张', '15x15cm'] },
  { id: 7, name: '新手入门套装', desc: '珠子、板子、镊子和熨烫纸一次配齐', price: 39.9, originalPrice: 68.0, sales: 6700, rating: 4.9, tag: '推荐', color: '#0EA5E9', icon: 'package', cat: '套装', specs: ['24色', '全套'] },
  { id: 8, name: '夜光珠 12 色', desc: '适合做夜灯和挂件装饰', price: 19.9, sales: 2100, rating: 4.4, color: '#FBBF24', icon: 'sun', cat: '珠子', specs: ['12色', '夜光'] },
  { id: 9, name: '收纳盒 36 格', desc: '便于按色号分类整理', price: 15.9, originalPrice: 22.0, sales: 5100, rating: 4.7, color: '#F87171', icon: 'archive', cat: '工具', specs: ['36格', '27x17cm'] },
  { id: 10, name: '磁铁贴片 100 片', desc: '适合做冰箱贴成品', price: 7.5, sales: 4300, rating: 4.5, color: '#16A34A', icon: 'disc', cat: '配件', specs: ['100片', '自粘'] },
];

export interface MockPatternListing {
  id: number;
  title: string;
  author: string;
  authorId: number;
  price: number;
  free: boolean;
  patIdx: number;
  cat: string;
  downloads: number;
  rating: number;
  cols: number;
  rows: number;
  desc: string;
  gridData?: string[][];
  createdAt: string;
}

export const MARKET_PATTERN_CATEGORIES = ['全部', '动物', '卡通', '花卉', '美食', '抽象', '像素'];
export const MARKET_PATTERN_SORTS = ['最新', '最热', '价格从低到高', '免费'];
export const MOCK_PATTERN_LISTINGS: MockPatternListing[] = [
  { id: 201, title: '像素爱心', author: '木木手作', authorId: 2, price: 0, free: true, patIdx: 0, cat: '抽象', downloads: 3280, rating: 4.9, cols: 10, rows: 9, desc: '经典红色爱心，新手练习首选', createdAt: '2026-04-01' },
  { id: 202, title: '橘猫头像', author: '木木手作', authorId: 2, price: 2.9, free: false, patIdx: 1, cat: '动物', downloads: 2100, rating: 4.8, cols: 9, rows: 8, desc: '适合挂件与卡片的小尺寸图纸', createdAt: '2026-04-02' },
  { id: 203, title: '复古蘑菇', author: '游戏存档', authorId: 4, price: 1.9, free: false, patIdx: 2, cat: '卡通', downloads: 1800, rating: 4.7, cols: 10, rows: 9, desc: '复古游戏主题常用图案', createdAt: '2026-04-03' },
  { id: 204, title: '粉色小花', author: '清晨花园', authorId: 5, price: 0, free: true, patIdx: 3, cat: '花卉', downloads: 900, rating: 4.6, cols: 9, rows: 10, desc: '贺卡和礼物封面常用花卉图纸', createdAt: '2026-04-03' },
  { id: 205, title: '夜空星点', author: '像素研究所', authorId: 3, price: 1.5, free: false, patIdx: 4, cat: '抽象', downloads: 750, rating: 4.5, cols: 9, rows: 9, desc: '适合小尺寸徽章与装饰牌', createdAt: '2026-04-04' },
  { id: 206, title: '双果挂件', author: '饰品工作室', authorId: 6, price: 0, free: true, patIdx: 5, cat: '美食', downloads: 1400, rating: 4.7, cols: 9, rows: 8, desc: '适合挂件和耳饰样片', createdAt: '2026-04-05' },
  { id: 207, title: '蓝宝石切面', author: '宝石档案', authorId: 7, price: 3.9, free: false, patIdx: 6, cat: '抽象', downloads: 1100, rating: 4.8, cols: 9, rows: 7, desc: '练习透明珠和高光层次的图纸', createdAt: '2026-04-05' },
  { id: 208, title: '七色彩虹', author: '拼豆小屋', authorId: 8, price: 1.9, free: false, patIdx: 7, cat: '像素', downloads: 1600, rating: 4.9, cols: 9, rows: 7, desc: '教程作者常用入门图纸', createdAt: '2026-04-06' },
];

export const MARKET_TABS_DEF = [
  { key: 'material' as const, icon: 'shopping-bag' as const, label: '材料商城', sub: '珠子、工具、配件' },
  { key: 'pattern' as const, icon: 'file-text' as const, label: '图纸市场', sub: '设计、模板、创意' },
];
