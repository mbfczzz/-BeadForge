import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface DanmakuRow {
  id: number;
  text: string;
  color?: string;
}

export const danmakuApi = {
  list: (designId: number | string) =>
    client.get<any, ApiRes<DanmakuRow[]>>(`/designs/${designId}/danmaku`),

  send: (designId: number | string, text: string, color?: string) =>
    client.post<any, ApiRes<DanmakuRow>>(`/designs/${designId}/danmaku`, { text, color }),
};
