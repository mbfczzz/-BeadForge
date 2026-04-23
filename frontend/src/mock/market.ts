import type { MarketTabDef, MaterialProduct, PatternListingSeed } from '../api/market';

export const MARKET_MATERIAL_CATEGORIES = ['全部', '珠子', '拼豆板', '工具', '套装', '配件'];
export const MARKET_MATERIAL_SORTS = ['综合', '销量', '价格从低到高', '价格从高到低'];

export const MOCK_PRODUCTS: MaterialProduct[] = [
  { id: 1, name: '5mm 标准珠 48 色', desc: '适合入门练习和常规挂件制作', price: 29.9, originalPrice: 49.9, sales: 8234, rating: 4.8, tag: '热卖', color: '#EF4444', icon: 'box', cat: '珠子', specs: ['5mm', '48 色', '约 9000 颗'] },
  { id: 2, name: '2.6mm 迷你珠 72 色', desc: '适合精细图案和饰品打样', price: 45.0, sales: 3421, rating: 4.9, color: '#8B5CF6', icon: 'box', cat: '珠子', specs: ['2.6mm', '72 色', '约 10000 颗'] },
  { id: 3, name: '大号拼豆板 29x29', desc: '透明材质，可拼接扩展', price: 8.9, originalPrice: 12.0, sales: 12500, rating: 4.7, tag: '常备', color: '#3B82F6', icon: 'layout', cat: '拼豆板', specs: ['29x29', '透明'] },
  { id: 4, name: '六角拼豆板', desc: '适合徽章和装饰牌结构', price: 6.5, sales: 5600, rating: 4.6, color: '#22C55E', icon: 'hexagon', cat: '拼豆板', specs: ['六角形', '透明'] },
  { id: 5, name: '尖头镊子', desc: '适合精准摆放迷你珠', price: 5.9, sales: 9870, rating: 4.8, color: '#F97316', icon: 'tool', cat: '工具', specs: ['不锈钢', '尖头'] },
  { id: 6, name: '熨烫纸 50 张', desc: '耐高温，不易粘珠', price: 3.5, originalPrice: 5.0, sales: 15600, rating: 4.5, tag: '常用', color: '#EC4899', icon: 'file', cat: '配件', specs: ['50 张', '15x15cm'] },
  { id: 7, name: '新手入门套装', desc: '珠子、板子、镊子和熨烫纸一次配齐', price: 39.9, originalPrice: 68.0, sales: 6700, rating: 4.9, tag: '推荐', color: '#0EA5E9', icon: 'package', cat: '套装', specs: ['24 色', '全套'] },
  { id: 8, name: '夜光珠 12 色', desc: '适合做夜灯和挂件装饰', price: 19.9, sales: 2100, rating: 4.4, color: '#FBBF24', icon: 'sun', cat: '珠子', specs: ['12 色', '夜光'] },
  { id: 9, name: '收纳盒 36 格', desc: '便于按色号分类整理', price: 15.9, originalPrice: 22.0, sales: 5100, rating: 4.7, color: '#F87171', icon: 'archive', cat: '工具', specs: ['36 格', '27x17cm'] },
  { id: 10, name: '磁铁贴片 100 片', desc: '适合做冰箱贴成品', price: 7.5, sales: 4300, rating: 4.5, color: '#16A34A', icon: 'disc', cat: '配件', specs: ['100 片', '自粘'] },
];

export const MARKET_PATTERN_CATEGORIES = ['全部', '动物', '卡通', '花草', '美食', '抽象', '像素'];
export const MARKET_PATTERN_SORTS = ['最新', '最热', '价格从低到高', '免费'];

export const MOCK_PATTERN_LISTINGS: PatternListingSeed[] = [
  { id: 201, title: '像素爱心', author: '木木手作', authorId: 2, price: 0, free: true, patIdx: 0, cat: '抽象', downloads: 3280, rating: 4.9, cols: 10, rows: 9, desc: '经典红色爱心，新手练习首选', createdAt: '2026-04-01' },
  { id: 202, title: '橘猫头像', author: '木木手作', authorId: 2, price: 2.9, free: false, patIdx: 1, cat: '动物', downloads: 2100, rating: 4.8, cols: 9, rows: 8, desc: '适合挂件与卡片的小尺寸图纸', createdAt: '2026-04-02' },
  { id: 203, title: '复古蘑菇', author: '游戏存档', authorId: 4, price: 1.9, free: false, patIdx: 2, cat: '卡通', downloads: 1800, rating: 4.7, cols: 10, rows: 9, desc: '复古游戏主题常用图案', createdAt: '2026-04-03' },
  { id: 204, title: '粉色小花', author: '清晨花园', authorId: 5, price: 0, free: true, patIdx: 3, cat: '花草', downloads: 900, rating: 4.6, cols: 9, rows: 10, desc: '贺卡和礼物封面常用花卉图纸', createdAt: '2026-04-03' },
  { id: 205, title: '夜空星点', author: '像素研究所', authorId: 3, price: 1.5, free: false, patIdx: 4, cat: '抽象', downloads: 750, rating: 4.5, cols: 9, rows: 9, desc: '适合小尺寸徽章与装饰牌', createdAt: '2026-04-04' },
  { id: 206, title: '双色挂件', author: '饰品工作室', authorId: 6, price: 0, free: true, patIdx: 5, cat: '美食', downloads: 1400, rating: 4.7, cols: 9, rows: 8, desc: '适合挂件和耳饰样片', createdAt: '2026-04-05' },
  { id: 207, title: '蓝宝石切面', author: '宝石档案', authorId: 7, price: 3.9, free: false, patIdx: 6, cat: '抽象', downloads: 1100, rating: 4.8, cols: 9, rows: 7, desc: '练习透明珠和高光层次的图纸', createdAt: '2026-04-05' },
  { id: 208, title: '七色彩虹', author: '拼豆小屋', authorId: 8, price: 1.9, free: false, patIdx: 7, cat: '像素', downloads: 1600, rating: 4.9, cols: 9, rows: 7, desc: '教程作者常用入门图纸', createdAt: '2026-04-06' },
];

export const MARKET_TABS_DEF: MarketTabDef[] = [
  { key: 'material', icon: 'shopping-bag', label: '材料商城', sub: '珠子、工具、配件' },
  { key: 'pattern', icon: 'file-text', label: '图纸市场', sub: '设计、模板、创意' },
];
