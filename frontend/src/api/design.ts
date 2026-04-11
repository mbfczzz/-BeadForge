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

export interface PageResult<T> {
  code: number;
  message: string;
  data: {
    records: T[];
    total: number;
    current: number;
    size: number;
  };
}

export const designApi = {
  getPublicList: (page = 1, size = 10, sortBy = 'latest', category?: string) =>
    client.get<any, PageResult<DesignItem>>('/designs/public/list', {
      params: { page, size, sortBy, category },
    }),

  getDetail: (id: number) =>
    client.get<any, { code: number; data: DesignItem }>(`/designs/public/${id}`),

  getMyDesigns: (page = 1, size = 10) =>
    client.get<any, PageResult<DesignItem>>('/designs/my', { params: { page, size } }),
};
