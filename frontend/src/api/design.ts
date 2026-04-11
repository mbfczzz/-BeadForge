import client from './client';

export interface DesignItem {
  id: number;
  userId: number;
  authorName?: string;
  title: string;
  description: string;
  category: string;
  coverImage: string | null;
  designData: string | null;
  status: string;
  likeCount: number;
  viewCount: number;
  createdAt: string;
}

export interface PageData<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export const designApi = {
  getPublicList: (page = 1, size = 10, sortBy = 'latest', category?: string) =>
    client.get<any, ApiRes<PageData<DesignItem>>>('/designs/public/list', {
      params: { page, size, sortBy, category: category || undefined },
    }),

  getDetail: (id: number) =>
    client.get<any, ApiRes<DesignItem>>(`/designs/public/${id}`),

  getMyDesigns: (page = 1, size = 10) =>
    client.get<any, ApiRes<PageData<DesignItem>>>('/designs/my', { params: { page, size } }),

  create: (data: { title: string; description: string; category: string }) =>
    client.post<any, ApiRes<DesignItem>>('/designs', data),

  update: (id: number, data: Partial<DesignItem>) =>
    client.put<any, ApiRes<DesignItem>>(`/designs/${id}`, data),

  delete: (id: number) =>
    client.delete<any, ApiRes<void>>(`/designs/${id}`),

  duplicate: (id: number) =>
    client.post<any, ApiRes<DesignItem>>(`/designs/${id}/duplicate`),
};
