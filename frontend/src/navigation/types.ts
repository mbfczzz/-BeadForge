import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DesignItem } from '../api/design';

/** 编辑器创作模式 */
export type EditorMode = 'manual' | 'image' | 'ai';

/** 根 Stack 路由参数表 */
export type RootStackParamList = {
  Main: undefined;
  DesignDetail: { item: DesignItem };
  Editor: { mode: EditorMode; cols: number; rows: number };
};

/** 快捷类型：某个 Screen 的 Props */
export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
