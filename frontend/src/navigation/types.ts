import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DesignItem } from '../api/design';

/** 编辑器创作模式 */
export type EditorMode = 'manual' | 'image' | 'ai';

/** 动态 Feed 项 */
export interface FeedItemData {
  id: number;
  user: { name: string; title: string };
  content: string;
  patternIdx: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timeAgo: string;
  tags: string[];
}

/** 根 Stack 路由参数表 */
export type RootStackParamList = {
  Main: undefined;
  DesignDetail: { item: DesignItem };
  Editor: { mode: EditorMode; cols: number; rows: number };
  FeedDetail: { feed: FeedItemData };
  UserProfile: { userName: string };
};

/** 快捷类型：某个 Screen 的 Props */
export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
