import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface OfficialMessageItem {
  id: string;
  rawId: number;
  channel: 'OFFICIAL' | 'ACTIVITY';
  title: string;
  content: string;
  icon: string;
  color: string;
  time: string;
}

export const officialMessageApi = {
  list: (channel?: 'OFFICIAL' | 'ACTIVITY') =>
    client.get<any, ApiRes<OfficialMessageItem[]>>('/official-messages', {
      params: channel ? { channel } : undefined,
    }),
};
