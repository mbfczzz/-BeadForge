import type { FeedbackTicketItem, FeedbackTicketStatus, FeedbackTicketType } from '../api/feedback';

export const FEEDBACK_TICKET_TYPES: FeedbackTicketType[] = ['功能问题', '订单问题', '体验建议'];

export const FEEDBACK_STATUS_COLORS: Record<FeedbackTicketStatus, string> = {
  处理中: '#2563EB',
  待回复: '#F59E0B',
  已完成: '#10B981',
};

export const INITIAL_FEEDBACK_TICKETS: FeedbackTicketItem[] = [
  {
    id: 'TK24042101',
    type: '功能问题',
    title: '头像上传后显示较慢',
    content: '提交头像后需要几秒才刷新，希望能更快一点。',
    status: '处理中',
    createdAt: '2026-04-21 18:22',
    screenshots: [],
    replies: [
      {
        id: 'R240421011',
        from: '用户',
        content: '修改头像并保存后，大约要等几秒头像才会刷新。',
        createdAt: '2026-04-21 18:22',
      },
      {
        id: 'R240421012',
        from: '客服',
        content: '已收到，我们正在排查头像缓存和刷新时机问题。',
        createdAt: '2026-04-21 19:05',
      },
    ],
  },
  {
    id: 'TK24041808',
    type: '订单问题',
    title: '订单状态和物流不同步',
    content: '订单页显示待收货，但物流已经签收。',
    status: '待回复',
    createdAt: '2026-04-18 09:40',
    screenshots: [],
    replies: [
      {
        id: 'R240418081',
        from: '用户',
        content: '物流显示昨天已经签收，但订单页还是待收货。',
        createdAt: '2026-04-18 09:40',
      },
    ],
  },
];
