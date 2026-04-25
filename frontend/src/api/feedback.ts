import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

interface PageRes<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

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

export const feedbackApi = {
  list: (page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<FeedbackTicketItem>>>('/feedback/tickets', { params: { page, size } }),

  detail: (id: string) =>
    client.get<any, ApiRes<FeedbackTicketItem>>(`/feedback/tickets/${id}`),

  create: (data: { type: FeedbackTicketType; title: string; content: string; screenshots?: string[] }) =>
    client.post<any, ApiRes<FeedbackTicketItem>>('/feedback/tickets', data),

  reply: (id: string, content: string) =>
    client.post<any, ApiRes<FeedbackTicketItem>>(`/feedback/tickets/${id}/reply`, { content }),
};
