import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedItemData } from '../api/community';
import type { EditorMode } from '../api/create';
import type { DesignItem } from '../api/design';
import type { HomeBannerItem } from '../api/discovery';
import type { ProductData } from '../api/market';

export type { EditorMode } from '../api/create';
export type { FeedItemData } from '../api/community';
export type { HomeBannerItem } from '../api/discovery';
export type { ProductData } from '../api/market';

export type RootStackParamList = {
  Main: undefined;
  DesignDetail: { item: DesignItem };
  ResourceDetail: { resourceId: number };
  BannerDetail: { banner: HomeBannerItem };
  Editor: { mode: EditorMode; cols: number; rows: number; initialGrid?: string[][]; designId?: number };
  FeedDetail: { feed: FeedItemData };
  PublishComposer: undefined;
  UserProfile: { userName: string };
  DirectMessage: { userName: string };
  ProductDetail: { product: ProductData };
  Cart: undefined;
  AddressManage: undefined;
  Payment:
    | { source: 'product'; product: ProductData; qty: number; variant: string }
    | { source: 'cart'; itemIds: string[] };
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
