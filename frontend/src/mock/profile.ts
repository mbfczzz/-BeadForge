import type { FeedItemData } from '../api/community';
import type {
  ProfileAddressItem,
  ProfileFavoriteItem,
  ProfileFollowUser,
  ProfileGivenLikeItem,
  ProfileNoticeItem,
  ProfileOrderItem,
  ProfileReceivedLikeItem,
  ProfileWalletLog,
} from '../api/profile';
import type { UserStats } from '../api/user';

export const MOCK_PROFILE_FAVORITES: ProfileFavoriteItem[] = [
  { id: 1, title: '像素爱心', author: '木木手作', patternIndex: 0, likeCount: 328 },
  { id: 2, title: '橘猫头像', author: '拼豆达人', patternIndex: 1, likeCount: 512 },
  { id: 3, title: '复古蘑菇', author: '游戏存档', patternIndex: 2, likeCount: 445 },
  { id: 4, title: '粉色小花', author: '清晨花园', patternIndex: 3, likeCount: 267 },
  { id: 5, title: '夜空星点', author: '像素研究所', patternIndex: 4, likeCount: 189 },
  { id: 6, title: '双色挂件', author: '饰品工作室', patternIndex: 5, likeCount: 376 },
];

export const MOCK_PROFILE_RECEIVED_LIKES: ProfileReceivedLikeItem[] = [
  { id: 11, userName: '木木手作', username: 'mumu_handmade', userTitle: '创作者', targetTitle: '像素花束卡片', targetType: '作品', timeAgo: '12 分钟前' },
  { id: 12, userName: '像素研究所', username: 'pixel_room', userTitle: '像素创作', targetTitle: '奶茶杯垫', targetType: '作品', timeAgo: '38 分钟前' },
  { id: 13, userName: '清晨花园', username: 'flower_garden', userTitle: '花草作者', targetTitle: '云朵钥匙扣', targetType: '作品', timeAgo: '2 小时前' },
  { id: 14, userName: '拼豆小屋', username: 'bead_store', userTitle: '教程作者', targetTitle: '今天补完了一组猫爪挂件', targetType: '动态', timeAgo: '昨天' },
  { id: 15, userName: '宝石档案', username: 'gem_notes', userTitle: '新手练习', targetTitle: '草莓贴片', targetType: '作品', timeAgo: '2 天前' },
  { id: 16, userName: '彩虹工坊', username: 'rainbow_lab', userTitle: '配色研究', targetTitle: '把花束系列整理成卡片尺寸', targetType: '动态', timeAgo: '3 天前' },
];

export const MOCK_PROFILE_GIVEN_LIKES: ProfileGivenLikeItem[] = [
  { id: 31, title: '橘猫头像', author: '木木手作', patternIndex: 1, likeCount: 512, targetType: '作品', timeAgo: '18 分钟前' },
  { id: 32, title: '复古蘑菇', author: '像素研究所', patternIndex: 2, likeCount: 445, targetType: '作品', timeAgo: '1 小时前' },
  { id: 33, title: '郁金香书签', author: '清晨花园', patternIndex: 3, likeCount: 267, targetType: '作品', timeAgo: '昨天' },
  { id: 34, title: '今天补完了一组猫爪挂件', author: '拼豆小屋', patternIndex: 7, likeCount: 128, targetType: '动态', timeAgo: '昨天' },
  { id: 35, title: '山谷日出', author: '小景观工作室', patternIndex: 4, likeCount: 288, targetType: '作品', timeAgo: '2 天前' },
  { id: 36, title: '把花束系列整理成卡片尺寸', author: '彩虹工坊', patternIndex: 6, likeCount: 356, targetType: '动态', timeAgo: '3 天前' },
];

export const MOCK_PROFILE_FOLLOWERS: ProfileFollowUser[] = [
  { id: 21, username: 'bead_master', nickname: '拼豆达人', bio: '偏爱像素风和小尺寸挂件。' },
  { id: 22, username: 'flower_garden', nickname: '清晨花园', bio: '花束、贺卡和礼物主题设计。' },
  { id: 23, username: 'rainbow_lab', nickname: '彩虹工坊', bio: '专注配色和渐变图案。' },
];

export const MOCK_PROFILE_FOLLOWING: ProfileFollowUser[] = [
  { id: 31, username: 'mumu_handmade', nickname: '木木手作', bio: '擅长入门作品和教程拆解。', followed: true },
  { id: 32, username: 'pixel_room', nickname: '像素研究所', bio: '复古像素图案和 AI 起稿流程。', followed: true },
  { id: 33, username: 'bead_store', nickname: '拼豆小屋', bio: '整理常用材料和尺寸建议。', followed: true },
];

export const MOCK_PROFILE_WALLET = {
  balance: 860,
  totalCharged: 1200,
  totalSpent: 340,
};

export const MOCK_PROFILE_WALLET_LOGS: ProfileWalletLog[] = [
  { id: 41, title: '购买图纸', description: '复古蘑菇图纸', amount: -19, createdAt: '2026-04-16 09:24' },
  { id: 42, title: '账户充值', description: '本地演示账户充值', amount: 300, createdAt: '2026-04-15 21:10' },
  { id: 43, title: '购买图纸', description: '夜空星点图纸', amount: -21, createdAt: '2026-04-14 18:06' },
];

export const MOCK_PROFILE_ADDRESSES: ProfileAddressItem[] = [
  {
    id: 'ADDR2401',
    receiver: 'BeadMori',
    phone: '13800138000',
    region: '上海市 浦东新区',
    detail: '张江高科技园区科苑路 88 号 3 幢 602',
    tag: '家',
    isDefault: true,
  },
  {
    id: 'ADDR2402',
    receiver: 'Mori Studio',
    phone: '13900139000',
    region: '上海市 徐汇区',
    detail: '漕溪北路 399 号汇智大厦 12 楼',
    tag: '公司',
  },
];

export const MOCK_PROFILE_ORDERS: ProfileOrderItem[] = [
  { id: 'BF240420001', title: '72 色拼豆新手套装', amount: 39.9, status: '待支付', createdAt: '2026-04-20', coverLabel: '套装' },
  { id: 'BF240419008', title: '5mm 标准珠 48 色', amount: 29.9, status: '待发货', createdAt: '2026-04-19', coverLabel: '珠子' },
  { id: 'BF240418015', title: '透明拼豆板 29x29', amount: 8.9, status: '待收货', createdAt: '2026-04-18', coverLabel: '板子' },
  { id: 'BF240416018', title: '夜光珠 12 色', amount: 19.9, status: '退款/售后', createdAt: '2026-04-16', coverLabel: '珠子' },
  { id: 'BF240414008', title: '新手入门套装', amount: 39.9, status: '已完成', createdAt: '2026-04-14', coverLabel: '套装' },
];

export const MOCK_PROFILE_NOTICES: ProfileNoticeItem[] = [
  { id: 1, type: '订单', title: '订单待支付提醒', content: '你有 1 笔订单还未支付，系统将为你保留库存 24 小时。', timeAgo: '刚刚', unread: true, action: { type: 'orderDetail', orderId: 'BF240420001', tab: '待支付' } },
  { id: 2, type: '订单', title: '商品已发货', content: '订单 BF240419008 已发货，物流正在揽收中。', timeAgo: '20 分钟前', unread: true, action: { type: 'orderDetail', orderId: 'BF240419008', tab: '待收货' } },
  { id: 3, type: '互动', title: '收到新的点赞', content: '木木手作 赞了你的作品《像素花束卡片》。', timeAgo: '1 小时前', unread: true, action: { type: 'likes' } },
  { id: 4, type: '系统', title: '签到奖励到账', content: '今日签到成功，积分 +20 已发放到你的账户。', timeAgo: '今天 09:20', action: { type: 'wallet' } },
  { id: 5, type: '系统', title: '新手教程已更新', content: '我们补充了拼豆板和熨烫纸的使用说明，适合刚入门的用户查看。', timeAgo: '昨天', action: { type: 'settings' } },
];

export function buildMockMyFeeds(displayName: string): FeedItemData[] {
  return [
    {
      id: 51,
      user: { name: displayName, title: '本地账号' },
      content: `${displayName} 今天把花束系列重新整理了一版，颜色层次比上一稿清楚很多。`,
      caption: '这次把摆拍背景也换成了更柔和的奶油色。',
      media: { type: 'image', demoAssetId: 'my-feed-image-1', aspectRatio: 0.92 },
      coverAccent: '#FF8DA8',
      likeCount: 36,
      commentCount: 8,
      shareCount: 2,
      timeAgo: '刚刚',
      tags: ['花束', '配色'],
      linkedPatternIdx: 3,
    },
    {
      id: 52,
      user: { name: displayName, title: '本地账号' },
      content: '把工作台收拾干净后拍了一段短视频，记录这次从起稿到成品的过程。',
      caption: '后面准备再补一版配色拆解。',
      media: { type: 'video', demoAssetId: 'my-feed-video-1', aspectRatio: 0.8, durationSec: 18 },
      coverAccent: '#6C8BFF',
      likeCount: 52,
      commentCount: 14,
      shareCount: 5,
      timeAgo: '昨天',
      tags: ['制作过程', '工作台'],
      linkedPatternIdx: 4,
    },
    {
      id: 53,
      user: { name: displayName, title: '本地账号' },
      content: '这个挂件系列拍成了循环小动图，转起来比静态图更有感觉。',
      caption: '准备把这一组做成摊位展示样片。',
      media: { type: 'gif', demoAssetId: 'my-feed-gif-1', aspectRatio: 1 },
      coverAccent: '#8E63FF',
      likeCount: 28,
      commentCount: 6,
      shareCount: 1,
      timeAgo: '3 天前',
      tags: ['挂件', '动图'],
      linkedPatternIdx: 1,
    },
  ];
}

export function getProfilePoints(stats: UserStats) {
  return stats.designCount * 20 + stats.likeCount * 2 + stats.followerCount * 3;
}
