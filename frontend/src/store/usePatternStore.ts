import { create } from 'zustand';

/** 图纸数据 */
export interface MarketPattern {
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
  gridData?: string[][]; // 实际图纸数据
  createdAt: string;
}

interface PatternState {
  /** 市场上所有图纸（含用户发布的） */
  listings: MarketPattern[];
  /** 当前用户已购买的图纸 ID */
  purchased: Set<number>;
  /** 当前用户发布的图纸 ID */
  myListings: Set<number>;

  /** 购买图纸 */
  buy: (id: number) => void;
  /** 发布图纸到市场 */
  publish: (pattern: Omit<MarketPattern, 'id' | 'downloads' | 'rating' | 'createdAt'>) => number;
  /** 下架 */
  unlist: (id: number) => void;
  /** 是否已购买 */
  hasBought: (id: number) => boolean;
  /** 是否是自己发布的 */
  isMine: (id: number) => boolean;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 初始 mock 图纸 */
const INIT_LISTINGS: MarketPattern[] = [
  { id: 101, title: '像素爱心', author: '小豆子', authorId: 2, price: 0, free: true, patIdx: 0, cat: '抽象', downloads: 3280, rating: 4.9, cols: 10, rows: 9, desc: '经典红色爱心，新手入门首选', createdAt: '2026-04-01' },
  { id: 102, title: '橘猫咪咪', author: '拼豆达人', authorId: 3, price: 2.9, free: false, patIdx: 1, cat: '动物', downloads: 2100, rating: 4.8, cols: 9, rows: 8, desc: '超萌橘猫正面照', createdAt: '2026-04-02' },
  { id: 103, title: '超级蘑菇', author: '游戏迷', authorId: 4, price: 1.9, free: false, patIdx: 2, cat: '卡通', downloads: 1800, rating: 4.7, cols: 10, rows: 9, desc: '马里奥经典红蘑菇', createdAt: '2026-04-03' },
  { id: 104, title: '粉色小花', author: '花花世界', authorId: 5, price: 0, free: true, patIdx: 3, cat: '花卉', downloads: 900, rating: 4.6, cols: 9, rows: 10, desc: '春日樱花主题', createdAt: '2026-04-03' },
  { id: 105, title: '闪耀金星', author: '星空漫步', authorId: 6, price: 1.5, free: false, patIdx: 4, cat: '抽象', downloads: 750, rating: 4.5, cols: 9, rows: 9, desc: '五角星经典造型', createdAt: '2026-04-04' },
  { id: 106, title: '双子樱桃', author: '水果控', authorId: 7, price: 0, free: true, patIdx: 5, cat: '美食', downloads: 1400, rating: 4.7, cols: 9, rows: 8, desc: '可爱的樱桃挂件', createdAt: '2026-04-05' },
  { id: 107, title: '冰蓝钻石', author: '珠宝匠', authorId: 8, price: 3.9, free: false, patIdx: 6, cat: '抽象', downloads: 1100, rating: 4.8, cols: 9, rows: 7, desc: '钻石造型', createdAt: '2026-04-05' },
  { id: 108, title: '七色彩虹', author: '彩虹桥', authorId: 9, price: 1.9, free: false, patIdx: 7, cat: '像素', downloads: 1600, rating: 4.9, cols: 9, rows: 7, desc: '经典彩虹，7种颜色', createdAt: '2026-04-06' },
];

let nextId = 200;

export const usePatternStore = create<PatternState>((set, get) => ({
  listings: INIT_LISTINGS,
  purchased: new Set<number>(),
  myListings: new Set<number>(),

  buy: (id) => {
    set((s) => {
      const newPurchased = new Set(s.purchased);
      newPurchased.add(id);
      const newListings = s.listings.map((p) =>
        p.id === id ? { ...p, downloads: p.downloads + 1 } : p
      );
      return { purchased: newPurchased, listings: newListings };
    });
  },

  publish: (pattern) => {
    const id = nextId++;
    const newPattern: MarketPattern = {
      ...pattern,
      id,
      downloads: 0,
      rating: 5.0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    set((s) => {
      const newMyListings = new Set(s.myListings);
      newMyListings.add(id);
      return {
        listings: [newPattern, ...s.listings],
        myListings: newMyListings,
      };
    });
    return id;
  },

  unlist: (id) => {
    set((s) => {
      const newMyListings = new Set(s.myListings);
      newMyListings.delete(id);
      return {
        listings: s.listings.filter((p) => p.id !== id),
        myListings: newMyListings,
      };
    });
  },

  hasBought: (id) => get().purchased.has(id) || get().myListings.has(id),
  isMine: (id) => get().myListings.has(id),
}));
