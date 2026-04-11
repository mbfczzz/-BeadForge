import { create } from 'zustand';
import { DesignItem } from '../api/design';

/** Mock 数据 - 拼豆作品 */
const MOCK_DESIGNS: DesignItem[] = [
  { id: 1, userId: 1, authorName: '小豆子', title: '像素爱心', description: '经典红色爱心图案', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 328, viewCount: 1200, createdAt: '2026-04-01' },
  { id: 2, userId: 2, authorName: '拼豆达人', title: '橘猫咪咪', description: '超萌橘猫正面照', category: '动物', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 512, viewCount: 2100, createdAt: '2026-04-02' },
  { id: 3, userId: 3, authorName: '游戏迷', title: '超级蘑菇', description: '马里奥经典红蘑菇还原', category: '卡通', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 445, viewCount: 1800, createdAt: '2026-04-03' },
  { id: 4, userId: 1, authorName: '花花世界', title: '粉色小花', description: '春日樱花主题拼豆', category: '花卉', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 267, viewCount: 900, createdAt: '2026-04-03' },
  { id: 5, userId: 4, authorName: '星空漫步', title: '闪耀金星', description: '五角星经典造型', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 189, viewCount: 750, createdAt: '2026-04-04' },
  { id: 6, userId: 5, authorName: '水果控', title: '双子樱桃', description: '可爱的樱桃拼豆挂件', category: '美食', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 376, viewCount: 1400, createdAt: '2026-04-05' },
  { id: 7, userId: 2, authorName: '珠宝匠', title: '冰蓝钻石', description: '闪闪发光的钻石造型', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 298, viewCount: 1100, createdAt: '2026-04-05' },
  { id: 8, userId: 6, authorName: '彩虹桥', title: '七色彩虹', description: '经典彩虹拱门图案', category: '风景', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 421, viewCount: 1600, createdAt: '2026-04-06' },
  { id: 9, userId: 3, authorName: '小豆子', title: '迷你爱心钥匙扣', description: '可以做成钥匙扣的小爱心', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 156, viewCount: 600, createdAt: '2026-04-06' },
  { id: 10, userId: 7, authorName: '猫奴一号', title: '黑猫警长', description: '帅气的黑色小猫', category: '动物', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 534, viewCount: 2300, createdAt: '2026-04-07' },
  { id: 11, userId: 4, authorName: '拼豆小屋', title: '红蘑菇小屋', description: '童话里的蘑菇房子', category: '卡通', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 312, viewCount: 1300, createdAt: '2026-04-07' },
  { id: 12, userId: 8, authorName: '向日葵', title: '太阳花', description: '向日葵主题拼豆杯垫', category: '花卉', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 278, viewCount: 1050, createdAt: '2026-04-08' },
  { id: 13, userId: 5, authorName: '像素艺术家', title: '8-bit 星星', description: '复古游戏风星星', category: '像素', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 198, viewCount: 820, createdAt: '2026-04-08' },
  { id: 14, userId: 9, authorName: '甜品师', title: '草莓蛋糕', description: '超可爱的草莓蛋糕造型', category: '美食', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 467, viewCount: 1900, createdAt: '2026-04-09' },
  { id: 15, userId: 6, authorName: '彩虹桥', title: '日落渐变', description: '橙紫色渐变日落风景', category: '风景', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 356, viewCount: 1500, createdAt: '2026-04-09' },
  { id: 16, userId: 1, authorName: '小豆子', title: '皮卡丘', description: '经典宝可梦皮卡丘造型', category: '卡通', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 689, viewCount: 3200, createdAt: '2026-04-10' },
  { id: 17, userId: 10, authorName: '手作达人', title: '四叶草', description: '幸运四叶草挂饰', category: '花卉', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 234, viewCount: 980, createdAt: '2026-04-10' },
  { id: 18, userId: 7, authorName: '猫奴一号', title: '三花猫', description: '超萌三花猫正面像', category: '动物', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 412, viewCount: 1700, createdAt: '2026-04-10' },
  { id: 19, userId: 8, authorName: '珠宝匠', title: '紫水晶', description: '高贵的紫色宝石', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 187, viewCount: 720, createdAt: '2026-04-11' },
  { id: 20, userId: 2, authorName: '拼豆达人', title: '西瓜片', description: '夏日清凉西瓜造型', category: '美食', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 523, viewCount: 2400, createdAt: '2026-04-11' },
  { id: 21, userId: 9, authorName: '像素艺术家', title: '太空入侵者', description: '经典街机游戏像素角色', category: '像素', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 345, viewCount: 1350, createdAt: '2026-04-11' },
  { id: 22, userId: 3, authorName: '游戏迷', title: '1UP蘑菇', description: '绿色加命蘑菇', category: '卡通', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 298, viewCount: 1150, createdAt: '2026-04-11' },
  { id: 23, userId: 10, authorName: '手作达人', title: '雪花结晶', description: '冬日限定六角雪花', category: '抽象', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 276, viewCount: 1000, createdAt: '2026-04-11' },
  { id: 24, userId: 4, authorName: '星空漫步', title: '月亮与星', description: '夜空主题弯月和星星', category: '风景', coverImage: null, designData: null, status: 'PUBLISHED', likeCount: 389, viewCount: 1600, createdAt: '2026-04-11' },
];

interface DesignState {
  designs: DesignItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  sortBy: string;
  category: string | null;
  searchKeyword: string;

  setFilter: (sortBy?: string, category?: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  fetchDesigns: (refresh?: boolean) => Promise<void>;

  myDesigns: DesignItem[];
  myPage: number;
  myHasMore: boolean;
  myLoading: boolean;
  fetchMyDesigns: (refresh?: boolean) => Promise<void>;
}

const PAGE_SIZE = 10;

/** 模拟网络延迟 */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  page: 1,
  hasMore: true,
  loading: false,
  refreshing: false,
  error: null,

  sortBy: 'latest',
  category: null,
  searchKeyword: '',

  myDesigns: [],
  myPage: 1,
  myHasMore: true,
  myLoading: false,

  setFilter: (sortBy, category) => {
    const updates: Partial<DesignState> = {};
    if (sortBy !== undefined) updates.sortBy = sortBy;
    if (category !== undefined) updates.category = category;
    set({ ...updates, designs: [], page: 1, hasMore: true });
    get().fetchDesigns(true);
  },

  setSearchKeyword: (keyword) => {
    set({ searchKeyword: keyword });
  },

  fetchDesigns: async (refresh = false) => {
    const state = get();
    if (state.loading || (!refresh && !state.hasMore)) return;

    const page = refresh ? 1 : state.page;
    set({ loading: true, refreshing: refresh, error: null });

    await delay(600); // 模拟加载

    // 按分类筛选
    let pool = [...MOCK_DESIGNS];
    if (state.category) {
      pool = pool.filter((d) => d.category === getCategoryLabel(state.category!));
    }

    // 按排序
    if (state.sortBy === 'popular') {
      pool.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      pool.sort((a, b) => b.id - a.id);
    }

    const start = (page - 1) * PAGE_SIZE;
    const records = pool.slice(start, start + PAGE_SIZE);
    const allRecords = refresh ? records : [...state.designs, ...records];

    set({
      designs: allRecords,
      page: page + 1,
      hasMore: allRecords.length < pool.length,
      loading: false,
      refreshing: false,
    });
  },

  fetchMyDesigns: async (refresh = false) => {
    const state = get();
    if (state.myLoading || (!refresh && !state.myHasMore)) return;

    set({ myLoading: true });
    await delay(400);

    const myPool = MOCK_DESIGNS.filter((d) => d.userId === 1);
    const page = refresh ? 1 : state.myPage;
    const records = myPool.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const all = refresh ? records : [...state.myDesigns, ...records];

    set({
      myDesigns: all,
      myPage: page + 1,
      myHasMore: all.length < myPool.length,
      myLoading: false,
    });
  },
}));

/** 英文 key 转中文分类 */
function getCategoryLabel(key: string): string {
  const map: Record<string, string> = {
    animal: '动物', character: '卡通', flower: '花卉',
    food: '美食', scenery: '风景', abstract: '抽象', pixel: '像素',
  };
  return map[key] || key;
}
