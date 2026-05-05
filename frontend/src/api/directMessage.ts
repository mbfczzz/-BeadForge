import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface DmChatItem {
  id: string;
  sessionId: number;
  name: string;
  role: string;
  preview: string;
  time: string;
  unread: number;
}

export interface DmMessageItem {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  attachment?: 'photo' | 'gif';
}

export interface DmPeer {
  id: number;
  name: string;
  title: string;
  avatar?: string | null;
}

export interface DmThread {
  peer: DmPeer;
  messages: DmMessageItem[];
}

export const directMessageApi = {
  sessions: () =>
    client.get<any, ApiRes<DmChatItem[]>>('/direct-messages/sessions'),

  threadByName: (userName: string) =>
    client.get<any, ApiRes<DmThread>>(`/direct-messages/sessions/by-name/${encodeURIComponent(userName)}`),

  send: (userName: string, content: string, attachment?: 'photo' | 'gif') =>
    client.post<any, ApiRes<DmMessageItem>>(
      `/direct-messages/sessions/by-name/${encodeURIComponent(userName)}`,
      { content, attachment },
    ),

  markRead: (sessionId: number) =>
    client.post<any, ApiRes<void>>(`/direct-messages/sessions/${sessionId}/read`),
};
