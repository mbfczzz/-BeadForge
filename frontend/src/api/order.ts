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

export interface OrderItemDTO {
  id: string;
  productId: number;
  quantity: number;
  price: number;
}

export interface BackendOrderDTO {
  id: string;
  orderNo: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
  coverLabel?: string;
  category?: string;
  imageText?: string;
  itemCount?: number;
  receiver?: string;
  phone?: string;
  address?: string;
  trackingNo?: string;
  statusNote?: string;
  items: OrderItemDTO[];
}

export interface OrderCreatePayload {
  items: { productId: number; quantity: number }[];
}

export interface OrderStatCounts {
  pending: number;
  paid: number;
  shipped: number;
  completed: number;
  cancelled: number;
  refund: number;
}

export const orderApi = {
  list: (status?: string, page = 1, size = 50) =>
    client.get<any, ApiRes<PageRes<BackendOrderDTO>>>('/orders', { params: { status, page, size } }),

  statCounts: () =>
    client.get<any, ApiRes<OrderStatCounts>>('/orders/stat-counts'),

  detail: (id: string) =>
    client.get<any, ApiRes<BackendOrderDTO>>(`/orders/${id}`),

  create: (payload: OrderCreatePayload) =>
    client.post<any, ApiRes<BackendOrderDTO>>('/orders', payload),

  pay: (id: string) => client.post<any, ApiRes<BackendOrderDTO>>(`/orders/${id}/pay`),
  ship: (id: string) => client.post<any, ApiRes<BackendOrderDTO>>(`/orders/${id}/ship`),
  receive: (id: string) => client.post<any, ApiRes<BackendOrderDTO>>(`/orders/${id}/receive`),
  cancel: (id: string) => client.post<any, ApiRes<BackendOrderDTO>>(`/orders/${id}/cancel`),
  refund: (id: string) => client.post<any, ApiRes<BackendOrderDTO>>(`/orders/${id}/refund`),
};
