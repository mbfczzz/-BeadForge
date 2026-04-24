export type FeedbackTicketStatus = '处理中' | '待回复' | '已完成';
export type FeedbackTicketType = '功能问题' | '订单问题' | '体验建议';

export interface FeedbackTicketReply {
  id: string;
  from: '用户' | '客服';
  content: string;
  createdAt: string;
}

export interface FeedbackTicketItem {
  id: string;
  type: FeedbackTicketType;
  title: string;
  content: string;
  status: FeedbackTicketStatus;
  createdAt: string;
  screenshots: string[];
  replies: FeedbackTicketReply[];
}
