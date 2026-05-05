import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface UiConfigPayload {
  'create.sizes'?: any[];
  'create.methods'?: any[];
  'create.tips'?: any[];
  'mine.headerActions'?: any[];
  'mine.tools'?: any[];
  'mine.orderShortcuts'?: any[];
  'mine.menus'?: any[];
  'community.tabs'?: string[];
  'profile.tabs'?: any[];
  'feedback.ticketTypes'?: string[];
  'feedback.statusColors'?: Record<string, string>;
  'profile.orderTabs'?: any[];
  'profile.orderStatusMeta'?: Record<string, any>;
  'notifications.quickEntries'?: any[];
  [key: string]: any;
}

export const uiConfigApi = {
  all: () => client.get<any, ApiRes<UiConfigPayload>>('/ui-config'),
};
