import type { DesignItem } from '../api/design';
import { HOME_CATEGORIES, HOME_CATEGORY_KEYS } from './discovery';

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
      item.title.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
      || item.authorName?.toLowerCase().includes(q),
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
