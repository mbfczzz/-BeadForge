import { getDefaultHomeBanners, getDiscoverHomeConfig } from '../mock/discovery';

export type DiscoverAccessMode = 'free' | 'points' | 'member';
export type DiscoverSortMode = 'latest' | 'hot';

export interface HomeBannerItem {
  id: number;
  title: string;
  sub: string;
  pi: number;
  bg: string;
  cat?: string;
  sort?: DiscoverSortMode;
  enabled?: boolean;
  order?: number;
  eyebrow?: string;
  buttonText?: string;
  textColor?: string;
}

export interface DiscoverFilterTabDef {
  key: string;
  label: string;
  bannerIds?: number[];
  categories?: string[];
  accessModes?: DiscoverAccessMode[];
  sort?: DiscoverSortMode;
  enabled?: boolean;
  order?: number;
  resultTitle?: string;
  emptyText?: string;
  searchPlaceholder?: string;
}

export interface DiscoverHomeConfig {
  defaultTabKey: string;
  searchPlaceholder?: string;
  resultTitle?: string;
  emptyText?: string;
  tabs: DiscoverFilterTabDef[];
}

export interface DiscoverHomePayload {
  config: DiscoverHomeConfig;
  banners: HomeBannerItem[];
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const discoveryApi = {
  async getHomePayload(): Promise<DiscoverHomePayload> {
    await wait(120);

    return {
      config: getDiscoverHomeConfig(),
      banners: getDefaultHomeBanners(),
    };
  },
};
