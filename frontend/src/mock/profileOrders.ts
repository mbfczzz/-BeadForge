import { Feather } from '@expo/vector-icons';
import type { ProfileOrderFilterTab, ProfileOrderItem } from '../api/profile';

export type OrderFilterTab = ProfileOrderFilterTab | '已完成';
export type OrderActionKey =
  | 'cancel'
  | 'pay'
  | 'remind'
  | 'contact'
  | 'track'
  | 'confirm'
  | 'progress'
  | 'rebuy'
  | 'review';

export type OrderActionVariant = 'primary' | 'secondary';

export interface OrderActionItem {
  key: OrderActionKey;
  label: string;
  variant: OrderActionVariant;
}

export interface ProfileDisplayOrder extends ProfileOrderItem {
  orderNo: string;
  category: string;
  imageText: string;
  itemCount: number;
  receiver: string;
  phone: string;
  address: string;
  trackingNo?: string;
  statusNote: string;
}

export const PROFILE_ORDER_TABS: { key: OrderFilterTab; label: string }[] = [
  { key: '全部', label: '全部' },
  { key: '待支付', label: '待支付' },
  { key: '待发货', label: '待发货' },
  { key: '待收货', label: '待收货' },
  { key: '退款/售后', label: '退款/售后' },
  { key: '已完成', label: '已完成' },
];

export const PROFILE_ORDER_STATUS_META: Record<
  ProfileDisplayOrder['status'],
  { color: string; soft: string; border: string; icon: keyof typeof Feather.glyphMap }
> = {
  待支付: {
    color: '#F59E0B',
    soft: '#FFF4DE',
    border: '#F7D7A0',
    icon: 'clock',
  },
  待发货: {
    color: '#3B82F6',
    soft: '#EAF3FF',
    border: '#CCE0FF',
    icon: 'package',
  },
  待收货: {
    color: '#10B981',
    soft: '#E8FBF4',
    border: '#BCEFD9',
    icon: 'truck',
  },
  '退款/售后': {
    color: '#EF4444',
    soft: '#FFE8EA',
    border: '#FFC7CC',
    icon: 'rotate-ccw',
  },
  已完成: {
    color: '#94A3B8',
    soft: '#F3F6FA',
    border: '#D6E0EA',
    icon: 'check-circle',
  },
};

export const PROFILE_ORDERS: ProfileDisplayOrder[] = [
  {
    id: 'BF240420001',
    orderNo: 'BF240420001',
    title: '72 色拼豆新手套装',
    amount: 39.9,
    status: '待支付',
    createdAt: '2026-04-20 18:32',
    coverLabel: '套装',
    category: '材料套装',
    imageText: '72色',
    itemCount: 1,
    receiver: '测试用户',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路 88 号 3 幢 602',
    statusNote: '订单已创建，请在 24 小时内完成支付。',
  },
  {
    id: 'BF240419008',
    orderNo: 'BF240419008',
    title: '5mm 标准珠 48 色补充包',
    amount: 29.9,
    status: '待发货',
    createdAt: '2026-04-19 11:18',
    coverLabel: '彩珠',
    category: '彩珠补充',
    imageText: '48色',
    itemCount: 2,
    receiver: '测试用户',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路 88 号 3 幢 602',
    statusNote: '商家正在备货，预计 24 小时内出库。',
  },
  {
    id: 'BF240418015',
    orderNo: 'BF240418015',
    title: '透明拼豆底板 29x29',
    amount: 8.9,
    status: '待收货',
    createdAt: '2026-04-18 09:46',
    coverLabel: '底板',
    category: '基础工具',
    imageText: '底板',
    itemCount: 1,
    receiver: '测试用户',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路 88 号 3 幢 602',
    trackingNo: 'SF1088202604185566',
    statusNote: '包裹运输中，预计明日送达。',
  },
  {
    id: 'BF240416018',
    orderNo: 'BF240416018',
    title: '夜光珠 12 色补充包',
    amount: 19.9,
    status: '退款/售后',
    createdAt: '2026-04-16 14:08',
    coverLabel: '售后',
    category: '售后服务',
    imageText: '售后',
    itemCount: 1,
    receiver: '测试用户',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路 88 号 3 幢 602',
    trackingNo: 'AS240416018',
    statusNote: '售后申请已提交，平台正在处理中。',
  },
  {
    id: 'BF240414008',
    orderNo: 'BF240414008',
    title: '新手入门拼豆套装',
    amount: 39.9,
    status: '已完成',
    createdAt: '2026-04-14 12:26',
    coverLabel: '套装',
    category: '入门礼包',
    imageText: '入门',
    itemCount: 1,
    receiver: '测试用户',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路 88 号 3 幢 602',
    trackingNo: 'YT2404140088821',
    statusNote: '订单已完成，欢迎再次购买或分享评价。',
  },
  {
    id: 'BF240412113',
    orderNo: 'BF240412113',
    title: '樱花系列渐变配色包',
    amount: 66.0,
    status: '已完成',
    createdAt: '2026-04-12 20:14',
    coverLabel: '配色',
    category: '主题配色包',
    imageText: '樱花',
    itemCount: 1,
    receiver: '测试用户',
    phone: '13800138000',
    address: '上海市浦东新区张江高科技园区科苑路 88 号 3 幢 602',
    trackingNo: 'JT2404121136678',
    statusNote: '这笔订单已完成，你可以再次购买同系列配色包。',
  },
];

export function getProfileOrderActions(status: ProfileDisplayOrder['status']): OrderActionItem[] {
  switch (status) {
    case '待支付':
      return [
        { key: 'cancel', label: '取消订单', variant: 'secondary' },
        { key: 'pay', label: '立即支付', variant: 'primary' },
      ];
    case '待发货':
      return [
        { key: 'contact', label: '联系客服', variant: 'secondary' },
        { key: 'remind', label: '提醒发货', variant: 'primary' },
      ];
    case '待收货':
      return [
        { key: 'track', label: '查看物流', variant: 'secondary' },
        { key: 'confirm', label: '确认收货', variant: 'primary' },
      ];
    case '退款/售后':
      return [{ key: 'progress', label: '查看售后进度', variant: 'primary' }];
    case '已完成':
      return [
        { key: 'rebuy', label: '再次购买', variant: 'secondary' },
        { key: 'review', label: '去评价', variant: 'primary' },
      ];
    default:
      return [];
  }
}

export function toProfileOrderTab(status: ProfileDisplayOrder['status']): ProfileOrderFilterTab | undefined {
  return status === '已完成' ? undefined : (status as ProfileOrderFilterTab);
}

export function resolveProfileTrackingNo(order: ProfileDisplayOrder) {
  if (order.trackingNo) {
    return order.trackingNo;
  }

  if (order.status === '待支付') {
    return '支付完成后生成物流单号';
  }

  if (order.status === '待发货') {
    return '商家出库后更新物流信息';
  }

  if (order.status === '退款/售后') {
    return '售后单号处理中';
  }

  return '物流单号待更新';
}

export function buildProfileOrderTimeline(order: ProfileDisplayOrder) {
  switch (order.status) {
    case '待支付':
      return [
        { label: '提交订单', value: order.createdAt, active: true },
        { label: '等待支付', value: '请在 24 小时内完成支付', active: true },
        { label: '支付成功后进入备货流程', value: '系统会自动同步状态', active: false },
      ];
    case '待发货':
      return [
        { label: '订单支付成功', value: order.createdAt, active: true },
        { label: '商家正在备货', value: '仓库正在打包中', active: true },
        { label: '等待出库', value: '发货后将展示物流单号', active: false },
      ];
    case '待收货':
      return [
        { label: '订单支付成功', value: order.createdAt, active: true },
        { label: '商家已发货', value: resolveProfileTrackingNo(order), active: true },
        { label: '包裹运输中', value: order.statusNote, active: true },
      ];
    case '退款/售后':
      return [
        { label: '提交售后申请', value: order.createdAt, active: true },
        { label: '平台处理中', value: order.statusNote, active: true },
        { label: '等待售后结果', value: '结果会通过站内通知同步给你', active: false },
      ];
    case '已完成':
      return [
        { label: '订单支付成功', value: order.createdAt, active: true },
        { label: '包裹已签收', value: resolveProfileTrackingNo(order), active: true },
        { label: '订单已完成', value: '支持再次购买或去评价', active: true },
      ];
    default:
      return [];
  }
}
